/*
 * Perk
 * - upgradable, but may require a certain level of office
 * - has company-wide effects
 * - has decorative stats
 */

import util from 'util';
import _ from 'underscore';

const Perk = {
  init: function(perk) {
    return _.extend({
      upgradeLevel: 0
    }, perk);
  },
  hasNext: function(perk) {
    return perk.upgradeLevel < perk.upgrades.length - 1;
  },
  next: function(perk) {
    return this.hasNext(perk) ? perk.upgrades[perk.upgradeLevel + 1] : null;
  },
  current: function(perk) {
    return perk.upgrades[perk.upgradeLevel];
  },
  nextAvailable: function(perk, company) {
    // perk upgrade availability depends on whether or not the company
    // has the necessary techs and a high enough office
    return !this.hasNext(perk) ? false : this.isAvailable(this.next(perk), company);
  },
  isAvailable: function(perk, company) {
    if (company.office < perk.requiredOffice)
      return false;
    return perk.requiredTech == null || util.containsByName(company.technologies, perk.requiredTech);
  },
  computeStats: function(perk, company) {
    var results = {};
    _.each(this.current(perk).stats, function(st, name) {
      results[name] = Math.round(_.random(st[0] * company.workers.length, st[1] * company.workers.length));
    });
    return results;
  }
};

export default Perk;
