/*
 * Promo (Hype)
 * - promos increase company hype
 * - hype decays over time
 * - outrage affects how fast hype decays
 *   - it increases with certain factors
 *   - it decreases with higher forgetting rates
 */

import _ from 'underscore';
import config from 'config';

const outrageSeverity = {
  'deathToll': 1.2,
  'pollution': 1,
  'debtOwned': 0.8,
  'taxesAvoided': 0.6,
  'moralPanic': 0.4
}

const Promo = {
  init: function(promo) {
    return _.extend({
      requiredProgress: promo.power * 100,
      hype: 0
    }, promo);
  },

  decayHype: function(company) {
    company.hype *= config.HYPE_DECAY_RATE;
    company.outrage *= config.HYPE_DECAY_RATE - (company.player.forgettingRate - 1);
    company.outrage += _.reduce([
      'deathToll', 'pollution', 'debtOwned', 'moralPanic', 'taxesAvoided'
    ], function(m, v) {
      return m + ((company[v]/10000) * outrageSeverity[v]);
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
