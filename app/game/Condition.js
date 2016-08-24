import util from 'util';

const Condition = {
  operators: {
    eq: function(a, b) { return a == b; },
    gt: function(a, b) { return a > b; },
    ge: function(a, b) { return a >= b; },
    lt: function(a, b) { return a < b; },
    le: function(a, b) { return a <= b; },
    has: function(a, b) { return util.containsByName(a, b); }
  },
  satisfied: function(cond, player) {
    return this.operators[cond.op](this[cond.type](player), cond.val);
  },

  hype: (player) => player.company.hype,
  cash: (player) => player.company.cash,
  annualRevenue: (player) => player.company.annualRevenue,
  productsLaunched: (player) => player.company.productsLaunched,
  activeProducts: (player) => player.company.activeProducts.length,
  productTypes: (player) => player.company.productTypes.length,
  nPerks: (player) => player.company.perks.length,
  perks: (player) => player.company.perks,
  perkUpgrades: (player) => player.company.perkUpgrades,
  locations: (player) => player.company.locations.length,
  employees: (player) => player.company.workers.length,
  officeLevel: (player) => player.company.office,
  technologies: (player) => player.company.technologies.length,
  deathToll: (player) => player.company.deathToll,
  pollution: (player) => player.company.pollution,
  debtOwned: (player) => player.company.debtOwned,
  forgettingRate: (player) => player.forgettingRate,
  wageMultiplier: (player) => player.wageMultiplier,
  spendingMultiplier: (player) => player.spendingMultiplier,
  year: (player) => player.year,
  productDeveloping: (player) => player.company.product
};

export default Condition;
