import _ from 'underscore';
import Player from 'app/Player';
import Worker from 'game/Worker';
import Hiring from 'game/Hiring';

var worker = {
  "avatar": 1,
  "design": 1,
  "engineering": 1,
  "happiness": 1,
  "marketing": 1,
  "minSalary": 45000,
  "name": "Noe Sumner",
  "productivity": 1,
  "title": "Programmer",
  "robot": false,
  "attributes": [],
  "personality": "Eager"
};
var robot = {
  "avatar": 6,
  "design": 1,
  "engineering": 1,
  "happiness": 1,
  "marketing": 1,
  "minSalary": 45000,
  "name": "ROBOT",
  "productivity": 1,
  "robot": true,
  "title": "Programmer",
  "attributes": []
};

describe('Hiring', function() {
  var player, recruitment;
  beforeEach(function() {
    player = new Player();
    player.workers = [Worker.init(worker), Worker.init(robot)];
    recruitment = {
      "name": "Word-of-Mouth",
      "description": "Ask friends and family",
      "cost": 15000,
      "targetScore": 4,
      "robots": false
    };
  });

  describe('recruiting', function() {
    it('scores workers based on skills', function() {
      var w = player.workers[0];
      var score, oldScore = Hiring.score(w);
      _.each(['design', 'engineering', 'marketing', 'productivity'], function(name) {
        w[name] *= 2;
        score = Hiring.score(w);
        expect(score).toBeGreaterThan(oldScore);
        oldScore = score;
      });
    });

    it('returns no robots if not a robot recruitment', function() {
      var results = [];
      _.times(100, function() {
        var candidates = Hiring.recruit(recruitment, player, player.company);
        results.push(candidates.length == 1 && !candidates[0].robot);
      });
      expect(_.some(results)).toEqual(true);
    });

    it('returns only if a robot recruitment', function() {
      recruitment.robots = true;
      var results = [];
      _.times(100, function() {
        var candidates = Hiring.recruit(recruitment, player, player.company);
        results.push(candidates.length == 1 && candidates[0].robot);
      });
      expect(_.some(results)).toEqual(true);
    });

    it('returns only workers near the recruitment target score', function() {
      var results = [];
      player.workers[0].productivity = 10000;
      _.times(100, function() {
        var candidates = Hiring.recruit(recruitment, player, player.company);
        results.push(candidates.length == 0);
      });
      expect(_.every(results)).toEqual(true);
    });

    it('returns only workers not already hired by the company', function() {
      var results = [];
      player.company.workers.push(player.workers[0]);
      _.times(100, function() {
        var candidates = Hiring.recruit(recruitment, player, player.company);
        results.push(candidates.length == 0);
      });
      expect(_.every(results)).toEqual(true);
    });

    it('returns robots even if the company already has one', function() {
      var results = [];
      recruitment.robots = true;
      player.company.workers.push(player.workers[1]);
      _.times(100, function() {
        var candidates = Hiring.recruit(recruitment, player, player.company);
        results.push(candidates.length == 1 && candidates[0].robot);
      });
      expect(_.some(results)).toEqual(true);
    });

    it('includes employees of other companies as candidates', function() {
      var results = [],
          competitor = {workers: []};
      competitor.workers.push(player.workers[0]);
      _.times(100, function() {
        var candidates = Hiring.recruit(recruitment, player, player.company);
        results.push(candidates.length == 1 && !candidates[0].robot);
      });
      expect(_.some(results)).toEqual(true);
    });
  });

  describe('negotiation', function() {
    it('will accept an offer at or above min salary', function() {
      var minSalary = 10000;
      expect(Hiring.acceptOfferProb(minSalary, 10000)).toEqual(1);
      expect(Hiring.acceptOfferProb(minSalary, 20000)).toEqual(1);
    });

    it('has a lower chance of accepting an offer further below than min salary', function() {
      var minSalary = 10000,
          prob = Hiring.acceptOfferProb(minSalary, 9000);
      expect(prob).toBeLessThan(1);
      expect(Hiring.acceptOfferProb(minSalary, 8000)).toBeLessThan(prob);
    });

    it('has a min salary modifier based on negotiation dialogue', function() {
      var negotiation = {
        "text": "We're building products that will change the world.",
        "personalities": {
          "Cynical": -1,
          "Eager": 1
        }
      };

      worker.personality = "Eager";
      expect(Hiring.negotiationEffect(worker, negotiation)).toBeLessThan(1);

      worker.personality = "Cynical";
      expect(Hiring.negotiationEffect(worker, negotiation)).toBeGreaterThan(1);

      worker.personality = "floop";
      expect(Hiring.negotiationEffect(worker, negotiation)).toEqual(1);
    });

    it('can have modifiers that affect min salary', function() {
      var minSalary = Worker.minSalary(worker, player);
      expect(Worker.minSalary(worker, player, [1.1])).toBeGreaterThan(minSalary);
      expect(Worker.minSalary(worker, player, [0.9])).toBeLessThan(minSalary);
    });
  });
});


