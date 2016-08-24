import util from 'util';
import _ from 'underscore';
import Perk from './Perk';
import Enums from '../Enums';
import Promo from './Promo';
import Effect from './Effect';
import Worker from './Worker';
import Product from './Product';
import offices from 'data/offices.json';

const SKILL_SCALE = 16;
const BASE_BURNOUT_RATE = 0.01;
const BASE_TAX_RATE = 0.3;

class Company {
  constructor(data, player) {
    var data = data || {};
    this.player = player || {};
    this.player.company = this;
    _.extend(this, {
      name: 'DEFAULTCORP',
      cash: 0,
      workers: [],
      productTypes: [],
      productBonuses: {},
      workerBonuses: {
        happiness: 1,
        productivity: 1,
        marketing: 1,
        design: 1,
        engineering: 1,
        burnoutRate: 0
      },
      office: Enums.Office.Apartment,

      deathToll: 0,
      debtOwned: 0,
      taxesAvoided: 0,
      pollution: 0,

      lifetimeRevenue: 0,
      lifetimeCosts: 0,
      annualRevenue: 0,
      annualCosts: 0,
      lastAnnualRevenue: 0,
      lastAnnualCosts: 0,

      perks: [],
      locations: [],
      verticals: [],
      technologies: [],
      specialProjects: [],
      lobbies: [],
      markets: [],
      acquisitions: [],
      discoveredProducts: [],
      activeProducts: [],
      productsLauched: 0,

      hype: 0,
      outrage: 0,
      promo: null,
      product: null
    }, data);
  }

  getWorkerBonus(attr) {
    return this.workerBonuses[attr] || 0;
  }
  getProductBonus(attr, vertical) {
    var bonuses = this.productBonuses[vertical] || {};
    return bonuses[attr] || 0;
  }

  get burnoutRate() {
    return BASE_BURNOUT_RATE + this.getWorkerBonus('burnoutRate');
  }

  updateBurnout() {
    var self = this;
    _.each(this.workers, w => Worker.updateBurnout(w, self));
  }

  _getSkill(name) {
    // company bonus from workers are applied for each worker
    var companyBonusFromWorkers = _.reduce(this.workers, function(m, w) { return m + Worker.companyBonus(w, name) }, 0);
    var fromWorkers = Math.max(0, _.reduce(this.workers, function(m, w) { return m + (w.burnout > 0 ? 0 : Worker[name](w)) }, this.workerBonuses[name]));
    var fromLocations = Math.max(0, _.reduce(this.locations, function(m, l) { return m + l.skills[name] }, 0));
    return fromWorkers + fromLocations + (companyBonusFromWorkers * (this.workers.length + this.locations.length));
  }

  get productivity() {
    return this._getSkill('productivity');
  }
  get happiness() {
    return this._getSkill('happiness');
  }
  get design() {
    return this._getSkill('design');
  }
  get engineering() {
    return this._getSkill('engineering');
  }
  get marketing() {
    return this._getSkill('marketing');
  }

  get sizeLimit() {
    return offices[this.office].size;
  }
  get remainingSpace() {
    return this.sizeLimit - this.workers.length;
  }

  get annualProfit() {
    return this.annualRevenue - this.annualCosts;
  }
  get salaries() {
    return _.reduce(this.workers, function(mem, w) {
      return mem + w.salary;
    }, 0);
  }
  get rent() {
    return _.reduce(this.locations, function(mem, l) {
      return mem + l.cost;
    }, 0)/1000 * this.player.costMultiplier * 12;
  }
  get taxes() {
    return this.annualRevenue * this.player.taxRate;
  }

  earn(cash) {
    this.cash += cash;
    this.annualRevenue += cash;
    this.lifetimeRevenue += cash;
  }
  pay(cost) {
    if (this.cash - cost >= 0) {
      this.cash -= cost;
      this.annualCosts += cost;
      this.lifetimeCosts += cost;
      return true;
    }
    return false;
  }
  payMonthly() {
    this.pay(this.salaries + this.rent);
  }
  payAnnual() {
    var expectedTaxes = this.annualRevenue * BASE_TAX_RATE;
    this.taxesAvoided += expectedTaxes - this.taxes;
    this.pay(this.taxes);
    this.annualRevenue = 0;
  }

  hireEmployee(worker, salary) {
    worker.salary = salary;
    this.workers.push(worker);
  }

  hasPerk(perk) {
    return util.contains(this.perks, perk);
  }
  buyPerk(perk) {
    if (this.pay(Perk.next(perk).cost)) {
      if (!this.hasPerk(perk)) {
        this.perks.push(perk);
      } else {
        perk.upgradeLevel++;
      }
      Effect.applies(Perk.current(perk).effects, this.player);
      return true;
    }
    return false;
  }
  buyAcquisition(acquisition) {
    if (this.pay(acquisition.cost)) {
      this.acquisitions.push(acquisition);
      Effect.applies(acquisition.effects, this.player);

      // check if an associated AI company is now defeated
      var competitor = util.byName(this.player.competitors, acquisition.name);
      if (competitor) {
        competitor.disabled = true;
      }
      return true;
    }
    return false;
  }
  buyLobby(lobby) {
    if (this.pay(lobby.cost)) {
      this.lobbies.push(lobby);
      Effect.applies(lobby.effects, this.player);
      return true;
    }
    return false;
  }
  specialProjectIsAvailable(specialProject) {
    var self = this;
    return _.every(specialProject.requiredProducts, function(prod) {
      return _.contains(self.discoveredProducts, prod);
    });
  }
  buySpecialProject(specialProject) {
    if (this.specialProjectIsAvailable(specialProject) && this.pay(specialProject.cost)) {
      this.specialProjects.push(specialProject);
      Effect.applies(specialProject.effects, this.player);
      return true;
    }
    return false;
  }
  buyVertical(vertical) {
    if (this.pay(vertical.cost)) {
      this.verticals.push(vertical);
      return true;
    }
    return false;
  }
  productTypeIsAvailable(pt) {
    return util.containsByName(this.verticals, pt.requiredVertical) && util.contains(this.player.unlocked.productTypes, pt);
  }
  buyProductType(pt) {
    if (this.productTypeIsAvailable(pt) && this.pay(pt.cost)) {
      this.productTypes.push(pt);
      return true;
    }
    return false;
  }
  researchIsAvailable(tech) {
    var self = this;
    return util.containsByName(this.verticals, tech.requiredVertical) &&
      _.every(tech.requiredTechs, function(t) {
        return util.containsByName(self.technologies, t);
      });
  }
  buyResearch(tech) {
    if (this.researchIsAvailable(tech) && this.pay(tech.cost)) {
      this.technologies.push(tech);
      Effect.applies(tech.effects, this.player);
      return true;
    }
    return false;
  }
  buyLocation(location) {
    if (this.pay(location.cost)) {
      this.locations.push(location);
      if (!_.contains(this.markets, location.market)) {
        this.markets.push(location.market);
      }
      Effect.applies(location.effects, this.player);
      return true;
    }
    return false;
  }

  buyPromo(promo) {
    if (this.pay(promo.cost)) {
      this.promo = Promo.init(promo);
      return true;
    }
    return false;
  }
  developPromo() {
    if (this.promo) {
      var hype = Promo.hype(this.promo, this.marketing, this.productivity);
      this.promo.progress += this.productivity;
      this.promo.hypeGenerated += hype;
      this.hype += hype;
      if (this.promo.progress >= this.promo.requiredProgress) {
        this.promo = null;
      }
    }
  }

  startProduct(productTypes) {
    this.product = Product.create(productTypes, this);
    return this.product;
  }
  developProduct() {
    if (this.product) {
      this.product.progress += this.productivity;
      this.product.design += Math.round(this.design/SKILL_SCALE);
      this.product.marketing += Math.round(this.marketing/SKILL_SCALE);
      this.product.engineering += Math.round(this.engineering/SKILL_SCALE);
      if (this.product.progress >= this.product.requiredProgress) {
        this.finishProduct();
      }
    }
  }
  finishProduct() {
    var product = this.product;
    if (product.killsPeople)
        this.deathToll += _.random(0, 10);

    if (product.debtsPeople)
        this.debtOwned += _.random(0, 10);

    if (product.pollutes)
        this.pollution += _.random(0, 10);

    if (product.recipeName != 'Default' &&
        !_.contains(this.discoveredProducts, product.recipeName)) {
      this.discoveredProducts.push(product.recipeName);
      if (product.effects) {
        Effect.applies(product.effects, this.player);
      }
    }

    this.productsLaunched++;
    this.product = null;
    Product.launch(product, this);
  }

  harvestRevenue() {
    var self = this;
    _.each(this.activeProducts, function(p) {
      self.earn(Product.getRevenue(p));
      if (Math.round(p.revenue) <= 10) {
        self.activeProducts = _.without(self.activeProducts, p);
      }
    });
  }

  harvestCompanies() {
    var newRevenue = _.reduce(this.acquisitions, function(mem, c) {
      return mem + c.revenue/12;
    }, 0);
    this.cash += newRevenue;
    this.annualRevenue += newRevenue;
    this.lifetimeRevenue += newRevenue;
  }

  decayHype() {
    Promo.decayHype(this);
  }

  growEmployees() {
    _.each(this.workers, function(worker) {
      Worker.grow(worker);
    });
  }

  get nextOffice() {
    switch (this.office) {
      case 0:
        return util.byName(offices, 'office');
      case 1:
        return util.byName(offices, 'campus');
      default:
        return;
    }
  }
  upgradeOffice() {
    var next = this.nextOffice;
    if (next && this.pay(next.cost)) {
      this.office = next.level;
      return true;
    };
    return false;
  }
}

export default Company;
