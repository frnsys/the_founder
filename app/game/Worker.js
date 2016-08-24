import _ from 'underscore';
import Condition from './Condition';
import thoughts from 'data/thoughts.json';
import attributeBonuses from 'data/workerAttributes.json';

const GROWTH_PROB = 0.04;
const BASE_GROWTH_RATE = 0.01;
const MIN_BURNOUT_DAYS = 3;
const MAX_BURNOUT_DAYS = 6;
const MULTIPLY_ATTRIBS = ['minSalary'];
const BASE_HAPPINESS_MODIFIER = 5;

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


function getSkill(worker, name) {
  var val = worker[name] + Worker.selfBonus(worker, name);
  if (worker.company) {
    val += worker.company.getWorkerBonus(name);
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
    return worker.minSalary * player.economicStability * player.wageMultiplier * this.selfBonus(worker, 'minSalary') * modifier;
  },

  design: function(worker) {
    return getSkill(worker, 'design');
  },
  engineering: function(worker) {
    return getSkill(worker, 'engineering');
  },
  marketing: function(worker) {
    return getSkill(worker, 'marketing');
  },
  productivity: function(worker) {
    return getSkill(worker, 'productivity');
  },
  happiness: function(worker, player) {
    var happinessModifier = 1;
    if (player) {
      happinessModifier = BASE_HAPPINESS_MODIFIER;
      happinessModifier -= player.company.deathToll/1000;
      happinessModifier -= player.company.pollution/1000;
      happinessModifier += player.forgettingRate;
      happinessModifier = sigmoid(happinessModifier);
    }
    return Math.max(0, getSkill(worker, 'happiness') * happinessModifier);
  },

  fire: function(worker) {
    // TODO FIREWORKER FROM CURRENT EMPLOYER
    worker.salary = 0;
  },

  grow: function(worker) {
    var self = this;
    if (worker.burnout === 0) {
      _.each(['design', 'engineering', 'marketing'], function(attr) {
        if (Math.random() < GROWTH_PROB) {
          worker[attr] += BASE_GROWTH_RATE + self.selfBonus(worker, attr + '_growth');
        }
      });
    }
  },

  updateBurnout: function(worker, company) {
    if (!worker.burnout > 0) {
      worker.burnoutRisk += company.burnoutRate + this.selfBonus(worker, 'burnoutRate');
      if (Math.random() < worker.burnoutRisk + 0.01) {
        worker.burnout = _.random(MIN_BURNOUT_DAYS, MAX_BURNOUT_DAYS);
        worker.burnoutRisk = 0;
      }
    } else {
      worker.burnout -= 1;
    }
  },

  attributeEffectToString: function(name, val) {
    switch(name) {
        case 'minSalary':
          return `${Math.abs((1 - val) * 100)}% ${val < 1 ? 'lower' : 'higher'} min. salary`;
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
          return Condition.operators[c.op](Worker.conditions[c.type](worker), c.val);
        });
      }
      return companySatisfied && workerSatisfied;
    });
    worker.lastTweet = _.sample(candidates).text;
  }
}

Worker.conditions = {
  burnoutRisk: (worker) => worker.burnoutRisk,
  happiness: (worker) => worker.happiness
}

export default Worker;
