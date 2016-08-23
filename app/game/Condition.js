const Condition = {
  operators: {
    eq: function(a, b) { return a == b; },
    gt: function(a, b) { return a > b; },
    ge: function(a, b) { return a >= b; },
    lt: function(a, b) { return a < b; },
    le: function(a, b) { return a <= b; }
  },
  satisfied: function(cond, player) {
    return this.operators[cond.op](this[cond.type](player), cond.val);
  },

  hype: function(player) { return player.company.hype; },
  cash: function(player) { return player.company.cash; },
  annualRevenue: function(player) { return player.company.annualRevenue; },
  productsLaunched: function(player) { return player.company.productsLaunched; },
  activeProducts: function(player) { return player.company.activeProducts.length; },
  productTypes: function(player) { return player.company.productTypes.length; },
  locations: function(player) { return player.company.locations.length; },
  employees: function(player) { return player.company.workers.length; },
  officeLevel: function(player) { return player.company.office; },
  technologies: function(player) { return player.company.technologies.length; },
  deathToll: function(player) { return player.company.deathToll; },
  pollution: function(player) { return player.company.pollution; },
  debtOwned: function(player) { return player.company.debtOwned; },
  forgettingRate: function(player) { return player.forgettingRate; },
  wageMultiplier: function(player) { return player.wageMultiplier; },
  spendingMultiplier: function(player) { return player.spendingMultiplier; },
  year: function(player) { return player.year; },
  productDeveloping: function(player) { return player.company.product; }
};

export default Condition;
