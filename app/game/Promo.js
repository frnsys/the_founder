/*
 * Promo (Hype)
 * - promos increase company hype
 * - hype decays over time
 * - outrage affects how fast hype decays
 *   - it increases with certain factors
 *   - it decreases with higher forgetting rates
 */

import _ from 'underscore';

const HYPE_DECAY_RATE = 0.9;

const Promo = {
  init: function(promo) {
    return _.extend({
      requiredProgress: promo.power * 100,
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

Promo.MAJOR_SUCCESS_PROB = 0.02;
Promo.MAJOR_SUCCESS_MULT = 1.2;
Promo.MINOR_SUCCESS_PROB = 0.02;
Promo.MINOR_SUCCESS_MULT = 0.8;
export default Promo;
