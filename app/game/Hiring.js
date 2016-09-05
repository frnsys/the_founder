/*
 * Hiring
 * - workers are assigned a score based on their aggregate skill level
 * - recruitment strategies return a random set of workers within a particular range of scores
 *   - these workers must be "on the market"
 * - the "Purchase Robots" recruitment strategy returns only robots, the rest return only people
 * - candidates accept a salary offer with some probability depending on the offer
 *   - negotiation dialogue options influence this probability
 *    - what effect dialogue options have depends on the candidate's personality
 *    - this personality is hidden unless the player's "Worker Insight" is true
 *    - negotiation dialogue options may require a particular perk upgrade
 *   - if the offer fails, the candidate goes "off the market" for some number of weeks
 */

import _ from 'underscore';
import util from 'util';
import config from 'config';
import Worker from './Worker';
import negotiations from 'data/negotiations.json';

const Hiring = {
  availableWorkers: function(player, company) {
    return _.filter(player.workers, function(w) {
      return w.offMarketTime === 0 && (!_.contains(company.workers, w) || w.robot);
    });
  },
  recruit: function(recruitment, player, company) {
    var self = this,
        pool = _.map(this.availableWorkers(player, company), function(w) {
          return w.robot ? _.clone(w) : w;
        });
    var candidates = _.filter(pool, function(worker) {
      var score = self.score(worker),
          targetScore = recruitment.targetScore,
          prob = config.BASE_PROB;
      if (score <= targetScore - config.SCORE_RANGE || score >= targetScore + config.SCORE_RANGE) {
        prob = 0;
      } else {
        prob -= Math.abs((targetScore - score)/targetScore)/2;
      }
      return (worker.robot == recruitment.robots && Math.random() <= prob);
    });
    if (candidates.length >= 2) {
      return _.sample(candidates, _.random(1, candidates.length/2));
    }
    return candidates;
  },
  score: function(worker) {
    return Math.floor(
      Worker.design(worker) +
      Worker.engineering(worker) +
      Worker.marketing(worker) +
      Worker.productivity(worker));
  },
  acceptOfferProb: function(minSalary, offer) {
    if (offer >= minSalary) {
      return 1;
    } else {
      return 1 - Math.sqrt((minSalary - offer)/minSalary);
    }
  },
  acceptOffer: function(minSalary, offer) {
    var prob = this.acceptOfferProb(minSalary, offer);
    return Math.random() <= prob;
  },
  negotiationEffect: function(worker, choice) {
    var personality = worker.personality,
        effect = choice.personalities[personality] || 0;

    // positive effect, lower salary
    if (effect > 0) {
      return config.NEGOTIATION_LOWER_SALARY_EFFECT;
    } else if (effect < 0) {
      return config.NEGOTIATION_HIGHER_SALARY_EFFECT;
    } else {
      return 1;
    }
  },
  negotiationOptions: function(company) {
    return _.map(_.filter(negotiations, function(n) {
      return !n.requiresPerk || util.containsByName(company.perks, n.requiresPerk);
    }), n => _.clone(n));
  }
};

export default Hiring;
