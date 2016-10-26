/*
 * Company
 * - pays salaries, rent, and taxes
 *   - taxes paid vary according to a player variable
 * - aggregates skills across all employees (incl. locations)
 *   - burntout workers do not contribute
 * - has an Office level
 *   - upgradeable
 *   - affects employee size limit
 * - has Locations
 *   - are purchased
 *   - have company-wide effects
 *   - give access to new markets
 *   - cost rent
 *   - contribute skills to the company (like an employee; worker bonuses apply)
 * - has Acquisitions
 *   - are purchased
 *   - have company-wide effects
 *   - disables associated competitors
 *   - generates revenue
 * - has Verticals
 *   - are purchased
 *   - provides access to new product types and research
 * - has Product Types
 *   - are purchased
 * - also has Perks, Special Projects, Lobbies, and Research (technologies), all of which are paid for
 */

import util from 'util';
import config from 'config';
import _ from 'underscore';
import Task from './Task';
import Perk from './Perk';
import Enums from '../Enums';
import Promo from './Promo';
import Effect from './Effect';
import Worker from './Worker';
import Product from './Product';
import offices from 'data/offices.json';

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
      moralPanic: 0,
      taxesAvoided: 0,
      pollution: 0,

      lifetimeRevenue: 0,
      lifetimeCosts: 0,
      annualRevenue: 0,
      annualCosts: 0,
      expenditures: 0, // non-recurring annual costs
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
      products: [],
      discoveredProducts: [],
      activeProducts: [],
      productsLaunched: 0,
      versions: {},

      hype: 0,
      outrage: 0,
      tasks: []
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
    return config.BASE_BURNOUT_RATE + this.getWorkerBonus('burnoutRate');
  }

  updateBurnout() {
    _.each(this.workers, w => Worker.updateBurnout(w, this.player));
  }

  skill(name, workers, locations, scaleByProductivity, ignoreBurnout) {
    // company bonus from workers are applied for each worker
    var self = this,
        player = this.player,
        workers = workers || this.workers,
        locations = locations || this.locations,
        scaleByProductivity = scaleByProductivity || false,
        ignoreBurnout = ignoreBurnout || false;
    var companyBonusFromWorkers = _.reduce(workers, function(m, w) {
      return m + Worker.companyBonus(w, name);
    }, 0);
    var fromWorkers = Math.max(0, _.reduce(workers, function(m, w) {
      if (w.burnout > 0 && !ignoreBurnout) {
        return m;
      } else {
        return m + ((Worker[name](w, player) + companyBonusFromWorkers) * (scaleByProductivity ? Worker.productivity(w, player) : 1));
      }
    }, 0));
    var fromLocations = Math.max(0, _.reduce(locations, function(m, l) {
      return m + ((l.skills[name] + self.getWorkerBonus(name) + companyBonusFromWorkers) * (scaleByProductivity ? l.skills.productivity : 1));
    }, 0));
    return fromWorkers + fromLocations;
  }

  get productivity() {
    return this.skill('productivity');
  }
  get happiness() {
    return this.skill('happiness');
  }
  get design() {
    return this.skill('design');
  }
  get engineering() {
    return this.skill('engineering');
  }
  get marketing() {
    return this.skill('marketing');
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
      return mem + Math.round(w.salary/12);
    }, 0);
  }
  get rent() {
    return _.reduce(this.locations, function(mem, l) {
      return mem + l.cost;
    }, 0)/1000 * this.player.costMultiplier;
  }
  get taxes() {
    return Math.max(0, this.annualProfit * this.player.taxRate * config.BASE_TAX_RATE);
  }

  canAfford(cost) {
    return this.cash - cost >= 0;
  }
  earn(cash) {
    this.cash += cash;
    this.annualRevenue += cash;
    this.lifetimeRevenue += cash;
  }
  pay(cost, ignoreAfford, notExpenditure) {
    if (this.cash - cost >= 0 || ignoreAfford) {
      this.cash -= cost;
      this.annualCosts += cost;
      this.lifetimeCosts += cost;

      if (!notExpenditure) {
        this.expenditures += cost;
      }
      return true;
    }
    return false;
  }
  payMonthly() {
    this.pay(this.salaries + this.rent, true, true);
  }
  payAnnual() {
    var expectedTaxes = Math.max(0, this.annualRevenue * config.BASE_TAX_RATE);
    this.taxesAvoided += expectedTaxes - this.taxes;
    this.pay(this.taxes, true, true);
    this.lastAnnualRevenue = this.annualRevenue;
    this.lastAnnualCosts = this.annualCosts;
    this.annualRevenue = 0;
    this.annualCosts = 0;
    this.expenditures = 0;
  }

  hireEmployee(worker, salary) {
    this.annualRevenue = 0;
    this.expenditures = 0;
  }

  hireEmployee(worker, salary) {
    worker.salary = salary;
    this.workers.push(worker);
  }

  fireEmployee(worker) {
    worker.salary = 0;
    this.workers = _.without(this.workers, worker);
  }

  hasPerk(perk) {
    return util.contains(this.perks, perk);
  }
  buyPerk(perk) {
    var owned = this.hasPerk(perk);
    var cost = owned ? Perk.next(perk).cost : Perk.current(perk).cost;
    cost *= this.player.costMultiplier;
    if (this.pay(cost)) {
      if (!owned) {
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
    var cost = acquisition.cost * this.player.costMultiplier;
    if (this.pay(cost)) {
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
  specialProjectIsAvailable(specialProject) {
    var self = this;
    return _.every(specialProject.requiredProducts, function(prod) {
      return _.contains(self.discoveredProducts, prod);
    });
  }
  buyVertical(vertical) {
    var cost = vertical.cost * this.player.costMultiplier;
    if (this.pay(cost)) {
      this.verticals.push(vertical);
      return true;
    }
    return false;
  }
  productTypeIsAvailable(pt) {
    return util.containsByName(this.verticals, pt.requiredVertical) && _.contains(this.player.unlocked.productTypes, pt.name);
  }
  buyProductType(pt) {
    var cost = pt.cost * this.player.costMultiplier;
    if (this.productTypeIsAvailable(pt) && this.pay(cost)) {
      this.productTypes.push(Product.initType(pt));
      return true;
    }
    return false;
  }
  researchIsAvailable(tech) {
    var self = this;
    return util.containsByName(this.verticals, tech.requiredVertical) &&
      _.contains(this.player.unlocked.technologies, tech.name) &&
      _.every(tech.requiredTechs, function(t) {
        return util.containsByName(self.technologies, t);
      });
  }
  buyLocation(location) {
    var cost = location.cost * this.player.costMultiplier * this.player.expansionCostMultiplier;
    if (this.pay(cost)) {
      this.locations.push(location);
      if (!_.contains(this.markets, location.market)) {
        this.markets.push(location.market);
      }
      Effect.applies(location.effects, this.player);
      return true;
    }
    return false;
  }

  develop() {
    _.each(this.tasks, t => Task.develop(t, this));
  }

  startResearch(tech) {
    var cost = tech.cost * this.player.costMultiplier * this.player.researchCostMultiplier;
    if (this.researchIsAvailable(tech) && this.canAfford(cost)) {
      return Task.init('Research', tech);
    }
    return false;
  }

  startProduct(productTypes) {
    var product = Product.create(productTypes, this.productsLaunched === 0);
    return Task.init('Product', product);
  }

  finishProduct(product) {
    this.activeProducts.push(product);
    this.productsLaunched++;
  }

  productVersion(product) {
    if (!(product.name in this.versions)) {
      this.versions[product.name] = 1;
    } else {
      this.versions[product.name] += 1;
    }
    return this.versions[product.name];
  }

  startPromo(promo) {
    var cost = promo.cost * this.player.costMultiplier;
    if (this.canAfford(cost)) {
      promo = Promo.init(promo);
      return Task.init('Promo', promo);
    }
    return false;
  }

  startTask(task, workers, locations) {
    Task.start(task, workers, locations);
    this.tasks.push(task);
  }

  startLobby(lobby) {
    var cost = lobby.cost * this.player.costMultiplier;
    if (this.canAfford(cost)) {
      return Task.init('Lobby', _.extend({persuasion:0}, lobby));
    }
    return false;
  }

  startSpecialProject(specialProject) {
    var cost = specialProject.cost * this.player.costMultiplier;
    if (this.specialProjectIsAvailable(specialProject) && this.canAfford(cost)) {
      return Task.init('SpecialProject', _.extend({
        design: 0,
        marketing: 0,
        engineering: 0
      }, specialProject));
    }
    return false;
  }

  harvestRevenue() {
    var self = this;
    _.each(this.activeProducts, function(p) {
      self.earn(Product.getRevenue(p));
      if (Math.round(p.revenue) <= 10) {
        self.activeProducts = _.without(self.activeProducts, p);
        self.products.push(p);
      }
    });
  }

  harvestCompanies() {
    // random schedule is 24-48 frames b/w harvests, say 36
    var interval = 36;
    // so we want the no. of these intervals in a year
    var intervals = (config.SECONDS_PER_WEEK * config.WEEKS_PER_MONTH * 12)/interval;
    var newRevenue = _.reduce(this.acquisitions, function(mem, c) {
      return mem + c.revenue/intervals;
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

  task(id) {
    return _.find(this.tasks, t => t.id == id);
  }

  get idleEmployees() {
    return _.reduce(this.workers, (m,w) => {
      return m + (w.task ? 0 : 1);
    }, 0);
  }

  get idleLocations() {
    return _.reduce(this.locations, (m,l) => {
      return m + (l.task ? 0 : 1);
    }, -1); // -1 to skip the HQ
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

  get perkUpgrades() {
    return _.flatten(_.map(this.perks, function(p) {
      return _.filter(p.upgrades, function(u, i) {
        return i <= p.upgradeLevel;
      });
    }));
  }
}

export default Company;
