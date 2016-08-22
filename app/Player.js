import _ from 'underscore';
import util from 'util';
import Enums from './Enums';
import Board from 'game/Board';
import Worker from 'game/Worker';
import Company from 'game/Company';

import perks from 'data/perks.json';
import news from 'data/news.json';
import emails from 'data/emails.json';
import events from 'data/events.json';
import workers from 'data/workers.json';
import locations from 'data/locations.json';
import specialNews from 'data/specialNews.json';
import competitors from 'data/competitors.json';
import technologies from 'data/technologies.json';
import productTypes from 'data/productTypes.json';


class Player {
  constructor(data, companyData) {
    var data = data || {},
        companyData = companyData || {};
    this.company = new Company(companyData, this);
    _.extend(this, {
      unlocked: {
        locations: util.byNames(locations, ['New York', 'Boston', 'San Francisco']),
        specialProjects: [],
        productTypes: util.byNames(productTypes, ['Ad', 'Gadget', 'Mobile', 'Social Network', 'E-Commerce'])
      },

      specialEffects: {
        'Immortal':         false,
        'Cloneable':        false,
        'Prescient':        false,
        'Worker Insight':   false,
        'Worker Quant':     false,
        'The Founder AI':   false,
        'Automation':       false
      },

      month: 0,
      week: 0,
      year: 0,

      age: 25,
      startYear: 2001,
      died: false, // or "should have died"
      endYear: 2091, // when you die

      spendingMultiplier: 1,
      wageMultiplier: 1,
      forgettingRate: 1,
      economicStability: 1,
      taxRate: 1,
      expansionCostMultiplier: 1,
      costMultiplier: 1,
      economy: Enums.Economy.Neutral,
      nextEconomy: Enums.Economy.Neutral,

      competitors: _.map(competitors, function(competitor) {
        competitor = _.clone(competitor);
        competitor.productTypes = util.byNames(productTypes, competitor.productTypes);
        competitor.cash = 10000000;

        // TODO generate these manually or scale for difficulty
        competitor.design = 10;
        competitor.engineering = 10;
        competitor.marketing = 10;
        competitor.productivity = 10;

        return competitor;
      }),

      workers: _.map(workers, function(w) {
        return Worker.init(w);
      }),

      technologies: technologies,
      perks: perks,

      // event pools
      events: { pool: [] },
      allEvents: events,
      news: news,
      specialNews: specialNews,
      emails: emails,
      current: {
        news: [],
        emails: []
      },

      // board
      board: {
        profitTarget: 20000,
        lastProfit: 0,
        lastProfitTarget: 0,
        happiness: 10
      },
      growth: 0,

      // onboarding
      onboarding: {}
    }, data);
  }

  get snapshot() {
    var company = this.company;
    return {
      name: company.name,
      week: this.week,
      month: this.month,
      year: this.startYear + this.year,
      cash: company.cash,
      companyAge: this.year,
      profitTargetProgress: company.annualProfit/this.board.profitTarget,
      profitTargetProgressPercent: company.annualProfit/this.board.profitTarget * 100,
      profitTarget: this.board.profitTarget,
      lastProfitTarget: this.board.lastProfitTarget,
      boardStatus: Board.mood(this.board),
      design: company.design,
      marketing: company.marketing,
      engineering: company.engineering,
      productivity: company.productivity,
      happiness: company.happiness,
      hype: company.hype,
      outrage: company.outrage,
      cofounder: company.cofounder,
      employees: company.workers.length,
      salaries: company.salaries,
      rent: company.rent,
      n_locations: company.locations.length,
      locations: company.locations,
      globalCoverage: (company.locations.length/locations.length).toFixed(2),
      n_technologies: company.technologies.length,
      technologies: company.technologies,
      ytdCosts: company.annualCosts,
      ytdRevenue: company.annualRevenue,
      ytdProfit: company.annualProfit,
      revenueChange: company.annualRevenue - company.lastAnnualRevenue,
      profitChange: company.annualProfit - (company.lastAnnualRevenue - company.lastAnnualCosts),
      lifetimeRevenue: company.lifetimeRevenue,
      verticals: company.verticals,

      economy: util.enumName(this.economy, Enums.Economy),
      taxesAvoided: company.taxesAvoided,
      debtOwned: company.debtOwned,
      pollution: company.pollution,
      deathToll: company.deathToll,
      globalAvgWage: 7 * this.wageMultiplier,
      consumerSpending: this.spendingMultiplier * 100,
      forgettingRate: this.forgettingRate,

      hasExtraTerra: _.contains(company.markets, 'Extra Terra'),
      hasAlien: _.contains(company.markets, 'Alien'),

      showAnnualReport: this.year > 0,
      prevYear: this.startYear + this.year - 1,
      lastProfit: company.lastAnnualRevenue - company.lastAnnualCosts,
      lastRevenue: company.lastAnnualRevenue,
      lastCosts: company.lastAnnualCosts,
      growth: this.growth,
      boardStatus: Board.mood(this.board),

      news: this.current.news,
      emails: this.current.emails,

      product: company.product,
      activeProducts: company.activeProducts,
      promo: company.promo
    };
  }
}

export default Player;
