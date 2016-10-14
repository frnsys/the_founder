/*
 * Condition
 * - evaluates whether or not a set of conditions are satisfied
 */

import _ from 'underscore';
import util from 'util';
import Task from './Task';

const Condition = {
  operators: {
    eq: function(a, b) { return a == b; },
    gt: function(a, b) { return a > b; },
    ge: function(a, b) { return a >= b; },
    lt: function(a, b) { return a < b; },
    le: function(a, b) { return a <= b; },
    has: function(a, b) { return util.containsByName(a, b); },
    notHas: function(a, b) { return !util.containsByName(a, b); }
  },
  satisfied: function(cond, player) {
    return this.operators[cond.op](this[cond.type](player), cond.val);
  },

  hype: (player) => player.company.hype,
  board: (player) => player.board.happiness,
  cash: (player) => player.company.cash,
  annualRevenue: (player) => player.company.annualRevenue,
  productsLaunched: (player) => player.company.productsLaunched,
  activeProducts: (player) => player.company.activeProducts.length,
  productTypes: (player) => player.company.productTypes.length,
  nPerks: (player) => player.company.perks.length,
  perks: (player) => player.company.perks,
  perkUpgrades: (player) => player.company.perkUpgrades,
  lobbies: (player) => player.company.lobbies,
  nLobbies: (player) => player.company.lobbies.length,
  acquisitions: (player) => player.company.acquisitions,
  nMarkets: (player) => player.company.markets.length,
  locations: (player) => player.company.locations,
  nLocations: (player) => player.company.locations.length,
  employees: (player) => player.company.workers.length,
  officeLevel: (player) => player.company.office,
  nTechnologies: (player) => player.company.technologies.length,
  technologies: (player) => player.company.technologies,
  specialProjects: (player) => player.company.specialProjects,
  verticals: (player) => player.company.verticals,
  economy: (player) => player.economy,
  deathToll: (player) => player.company.deathToll,
  pollution: (player) => player.company.pollution,
  debtOwned: (player) => player.company.debtOwned,
  forgettingRate: (player) => player.forgettingRate,
  wageMultiplier: (player) => player.wageMultiplier,
  spendingMultiplier: (player) => player.spendingMultiplier,
  taxesAvoided: (player) => player.company.taxesAvoided,
  year: (player) => player.year,
  globalAvgWage: (player) => player.snapshot.globalAvgWage,
  consumerSpending: (player) => player.snapshot.consumerSpending,
  productDeveloping: (player) => _.filter(player.company.tasks, t => t.type == Task.Type.Product).length > 0,
  lifetimeRevenue: (player) => player.company.lifetimeRevenue,

  toString: function(cond) {
    // this doesn't cover all cases, just those used by challenges
    switch (cond.type) {
        case 'lobbies':
          switch (cond.op) {
            case 'has':
              return 'Complete the ' + cond.val + ' lobby.';
          }
        case 'nLobbies':
          switch (cond.op) {
            case 'ge':
              return 'Complete ' + cond.val + ' lobbies.';
          }
        case 'verticals':
          switch (cond.op) {
            case 'has':
              return 'Expand to ' + cond.val + ' vertical.';
          }
        case 'specialProjects':
          switch (cond.op) {
            case 'has':
              return 'Complete the ' + cond.val + ' special project.';
          }
        case 'nMarkets':
          switch (cond.op) {
            case 'gt':
              return 'Expand to a new market.';
          }
        case 'locations':
          switch (cond.op) {
            case 'has':
              return 'Expand to the ' + cond.val + ' location.';
          }
        case 'acquisitions':
          switch (cond.op) {
            case 'has':
              return 'Acquire ' + cond.val + '.';
          }
        case 'annualRevenue':
          switch (cond.op) {
            case 'ge':
              return 'Make at least ' + util.formatCurrencyAbbrev(cond.val) + ' in annual revenue.';
          }
        case 'officeLevel':
          switch (cond.val) {
              case 1:
                return `Upgrade to the open office.`
              case 2:
                return `Upgrade to the campus.`
          }
        default:
          return;
    }
  }
};

export default Condition;
