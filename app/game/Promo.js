import _ from 'underscore';

const HYPE_DECAY_RATE = 0.9;

const Promo = {
  init: function(promo) {
    return _.extend({
      progress: 0,
      requiredProgress: promo.power * 1000,
      hype: 0
    }, promo);
  },

  decayHype: function(company) {
    company.hype *= HYPE_DECAY_RATE;
    company.outrage *= HYPE_DECAY_RATE - (company.player.forgettingRate - 1);
    company.outrage += _.reduce([
      'deathToll', 'pollution', 'debtOwned', 'taxesAvoided'
    ], function(m, v) {
      return company[v]/1000;
    }, 0);
    company.hype -= company.outrage;
    company.hype = Math.max(0, company.hype);
  }
};

export default Promo;
