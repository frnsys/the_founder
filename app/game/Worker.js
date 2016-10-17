/*
 * Worker
 * - initializes workers
 * - computes worker bonuses from their attributes
 * - computes worker skill values, including bonuses
 *   - from their own attributes
 *   - from their company
 *   - in the case of happiness, other external factors are included
 * - sets a worker's last tweet
 * - handles worker growth (gradual/stochastic improvement in skills while hired)
 * - computes worker min salary
 *   - based on economy
 *   - wage pressure value
 *   - number of perks
 *   - negotiation factors
 * - manages worker burnout risk and status
 *   - if they are not burntout
 *     - worker burnout risk gradually increases according to base burnout rate and bonuses
 *       - burnout risk increase lessens with increased happiness, towards 0
 *     - rolls for burnout, if it happens, worker is burnout for some weeks
 *   - otherwise, decrement their burnout
 */

import _ from 'underscore';
import config from 'config';
import Economy from './Economy';
import Condition from './Condition';
import thoughts from 'data/thoughts.json';
import attributeBonuses from 'data/workerAttributes.json';

const MULTIPLY_ATTRIBS = ['minSalary'];
const cloneNameRe = /[^#]+/;
const cloneIdRe = /\d+/;

function sigmoid(v) {
  return 1/(1+Math.exp(-v));
}


function getAttributeBonus(worker, name, type) {
  var vals = _.compact(_.map(worker.attributes, function(attr) {
    if (attributeBonuses[attr][type]) {
      return attributeBonuses[attr][type][name];
    }
  }));
  if (_.contains(MULTIPLY_ATTRIBS, name)) {
    return _.reduce(vals, function(m, v) {
      return m * v;
    }, 1);
 } else {
    return _.reduce(vals, function(m, v) {
      return m + v;
    }, 0);
  }
  return bonuses;
}

function getAttributeBonuses(worker, name, type) {
  var bonuses = {};
  _.each(worker.attributes, function(attr) {
    var bonusData = attributeBonuses[attr][type];
    if (bonusData) {
      _.each(bonusData, function(val, key) {
        if (_.contains(MULTIPLY_ATTRIBS, key)) {
          bonuses[key] = (bonuses[key] || 1) * val;
        } else {
          bonuses[key] = (bonuses[key] || 0) + val;
        }
      });
    }
  });
  return bonuses;
}


function getSkill(worker, player, name) {
  var val = worker[name] + Worker.selfBonus(worker, name);
  if (player && player.company) {
    val += player.company.getWorkerBonus(name);
  }
  return Math.floor(val);
}

const Worker = {
  init: function(worker, robot) {
    return _.extend({
      salary: 0,
      burnout: 0,
      burnoutRisk: 0,
      offMarketTime: 0,
      lastTweet: 'Getting situated...',
      robot: robot
    }, worker);
  },

  selfBonus: function(worker, name) {
    return getAttributeBonus(worker, name, 'worker');
  },

  selfBonuses: function(worker) {
    return getAttributeBonuses(worker, name, 'worker');
  },

  companyBonus: function(worker, name) {
    return getAttributeBonus(worker, name, 'company');
  },

  companyBonuses: function(worker) {
    return getAttributeBonuses(worker, name, 'company');
  },

  minSalary: function(worker, player, modifiers) {
    var modifier = _.reduce(modifiers || [], (m,v) => m * v, 1);
    var perkMultiplier = this.perkSalaryMultiplier(player.company);
    return worker.minSalary * Economy.multiplier(player.economy) * player.wageMultiplier * this.selfBonus(worker, 'minSalary') * modifier * perkMultiplier;
  },

  perkSalaryMultiplier: function(company) {
    var reduction = _.reduce(company.perks, (m,p) => (p.upgradeLevel + 1) * config.PERK_SALARY_REDUCE_PERCENT, 0);
    return 1 - reduction;
  },

  design: function(worker, player) {
    return getSkill(worker, player, 'design');
  },
  engineering: function(worker, player) {
    return getSkill(worker, player, 'engineering');
  },
  marketing: function(worker, player) {
    return getSkill(worker, player, 'marketing');
  },
  productivity: function(worker, player) {
    return getSkill(worker, player, 'productivity');
  },
  happiness: function(worker, player) {
    var happinessModifier = 1;
    if (player) {
      happinessModifier = config.BASE_HAPPINESS_MODIFIER;
      happinessModifier -= player.company.deathToll/1000;
      happinessModifier -= player.company.pollution/1000;
      happinessModifier += player.forgettingRate;
      happinessModifier = sigmoid(happinessModifier);
    }
    return Math.max(0, getSkill(worker, player, 'happiness') * happinessModifier);
  },

  grow: function(worker) {
    var self = this;
    if (worker.burnout === 0) {
      _.each(['design', 'engineering', 'marketing'], function(attr) {
        if (Math.random() < config.GROWTH_PROB) {
          worker[attr] += config.BASE_GROWTH_RATE + self.selfBonus(worker, attr + '_growth');
        }
      });
    }
  },

  updateBurnout: function(worker, player) {
    var company = player.company;
    if (_.contains(worker.attributes, 'Tireless')) {
      return;
    }
    if (!worker.burnout > 0 && worker.task) {
      var inc = (company.burnoutRate + this.selfBonus(worker, 'burnoutRate'))/(Math.sqrt(Worker.happiness(worker, player)));
      // round to 3 decimal places
      inc = Math.round(inc*1e3)/1e3;
      worker.burnoutRisk += inc;
      if (Math.random() < (worker.burnoutRisk + 0.01)/2) {
        worker.burnout = _.random(config.MIN_BURNOUT_DAYS, config.MAX_BURNOUT_DAYS);
        worker.burnoutRisk = 0;
      }
    } else {
      worker.burnout -= 1;
    }
  },

  attributeEffectToString: function(name, val) {
    switch(name) {
        case 'minSalary':
          return `${Math.round(Math.abs((1 - val) * 100))}% ${val < 1 ? 'lower' : 'higher'} min. salary`;
        case 'noBurnout':
          return 'Never burns out';
        default:
          return `${val > 0 ? '+' : '-'}${Math.abs(val)} to ${name}`;
    }
  },

  attributeToStrings: function(name) {
    var strs = [],
        attr = attributeBonuses[name];
    if (attr.worker) {
      _.each(attr.worker, function(v, k) {
        strs.push(`${Worker.attributeEffectToString(k, v)} (self)`);
      });
    }
    if (attr.company) {
      _.each(attr.company, function(v, k) {
        strs.push(`${Worker.attributeEffectToString(k, v)} (company)`);
      });
    }
    return strs;
  },

  updateLastTweet: function(worker, player) {
    // special tweets for the cofounder
    if (worker.name == player.company.cofounder.name) {
      worker.lastTweet = 'Working hard on our company!';
    }

    var candidates = _.filter(thoughts, function(t) {
      var companySatisfied = true,
          workerSatisfied = true;
      if (t.companyConditions) {
        companySatisfied = _.every(t.companyConditions, function(c) {
          return Condition.satisfied(c, player);
        });
      }
      if (t.workerConditions) {
        workerSatisfied = _.every(t.workerConditions, function(c) {
          return Condition.operators[c.op](Worker.conditions[c.type](worker, player), c.val);
        });
      }
      return companySatisfied && workerSatisfied;
    });
    worker.lastTweet = _.sample(candidates).text;
  },


  clone: function(player, employee) {
    var name = employee.name,
        originalName = name.match(cloneNameRe)[0].replace(/^\s+|\s+$/g, '');

    // find most recent clone
    var clones = _.chain(player.workers)
      .filter(w => w.name.indexOf(originalName) >= 0)
      .sortBy(w => this.cloneNumber(w.name))
      .value();

    var latestClone = clones.pop(),
        clone = _.clone(latestClone);
    clone.name = `${originalName} #${this.cloneNumber(latestClone.name) + 1}`;
    return clone;
  },

  cloneNumber: function(name) {
    var number = name.match(cloneIdRe);
    if (number) {
      return parseInt(number[0])
    } else {
      return 1;
    }
  }
}

Worker.conditions = {
  burnoutRisk: (worker, player) => worker.burnoutRisk,
  happiness: (worker, player) => Worker.happiness(worker, player)
}

export default Worker;
