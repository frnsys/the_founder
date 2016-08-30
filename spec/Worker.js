import _ from 'underscore';
import Player from 'app/Player';
import Worker from 'game/Worker';

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
  "attributes": [
    "Team Player",
    "Go-Getter",
    "Driven"
  ]
}

describe('Worker', function() {
  var player, w;
  beforeEach(function() {
    player = new Player();
    w = Worker.init(worker);
  });

  it('should be distinct from the worker data', function() {
    expect(w).not.toBe(worker);
  });

  it('initializes dynamic values to 0', function() {
    expect(w.salary).toBe(0);
    expect(w.burnout).toBe(0);
  });

  it('loads self bonuses from attributes', function() {
    expect(Worker.selfBonuses(w)).toEqual({
      "productivity": 7,
      "design_growth": 0.005,
      "engineering_growth": 0.005,
      "marketing_growth": 0.005
    });
  });

  it('loads company bonuses from attributes', function() {
    expect(Worker.companyBonuses(w)).toEqual({
      "productivity": 1
    });
  });

  it('gets individual self bonuses', function() {
    expect(Worker.selfBonus(w, 'productivity')).toEqual(7);
    expect(Worker.selfBonus(w, 'design')).toEqual(0);
  });

  it('gets individual company bonuses', function() {
    expect(Worker.companyBonus(w, 'productivity')).toEqual(1);
    expect(Worker.companyBonus(w, 'design')).toEqual(0);
  });

  it('gets skills without company', function() {
    expect(Worker.productivity(w)).toEqual(worker.productivity + 7);
    expect(Worker.design(w)).toEqual(worker.design);
    expect(Worker.marketing(w)).toEqual(worker.marketing);
    expect(Worker.engineering(w)).toEqual(worker.engineering);
    expect(Worker.happiness(w)).toEqual(worker.happiness);
  });

  it('contributes skills to company', function() {
      _.each(['productivity', 'happiness', 'design', 'marketing', 'engineering'], function(name) {
        player.company.workers = [];
        var val = player.company[name];
        player.company.workers.push(w);
        expect(player.company[name]).toBeGreaterThan(val);
      });
  });

  it('contributes bonuses to the whole company', function() {
    player.company.workers.push(w);
    w.attributes = [];
    var val = player.company.productivity;
    w.attributes = ['Team Player'];
    expect(player.company.productivity).toBeGreaterThan(val);

    // scales up with number of employees
    var val = player.company.productivity;
    var otherWorker = _.clone(w);
    otherWorker.attributes = [];
    player.company.workers.push(otherWorker);
    expect(player.company.productivity).toBeGreaterThan(val);
  });

  it('improves skills over time', function() {
    // very unlikely they don't grow at all over 1000 tries
    var vals = _.pick(w, 'design', 'engineering', 'marketing');
    _.times(1000, function() {
      Worker.grow(w);
    });
    var result = _.some(_.keys(vals), function(name) {
      return vals[name] < w[name];
    });
    expect(result).toEqual(true);
  });

  describe('happiness', function() {
    it('decreases with death toll', function() {
      var val = Worker.happiness(w, player);
      player.forgettingRate = 0;
      player.company.pollution = 0;
      player.company.deathToll = 1000;
      expect(Worker.happiness(w, player)).toBeLessThan(val);
    });

    it('decreases with pollution', function() {
      var val = Worker.happiness(w, player);
      player.forgettingRate = 0;
      player.company.deathToll = 0;
      player.company.pollution = 1000;
      expect(Worker.happiness(w, player)).toBeLessThan(val);
    });

    it('increases with forgetting rate', function() {
      player.company.deathToll = 1000;
      var val = Worker.happiness(w, player);
      player.forgettingRate = 2;
      player.company.pollution = 0;
      expect(Worker.happiness(w, player)).toBeGreaterThan(val);
    });
  });

  describe('burn out', function() {
    it('can burn out if burnout risk > 0', function() {
      w.burnoutRisk = 1;
      expect(w.burnout).toEqual(0);
      Worker.updateBurnout(w, player);
      expect(w.burnout).toBeGreaterThan(0);
    });

    it('cannot burn out if burnout risk is 0', function() {
      w.burnoutRisk = 0;
      expect(w.burnout).toEqual(0);
      Worker.updateBurnout(w, player);
      expect(w.burnout).toEqual(0);
    });

    it('burnout risk resets after burnout', function() {
      w.burnoutRisk = 1;
      Worker.updateBurnout(w, player);
      expect(w.burnoutRisk).toEqual(0);
    });

    it('increases burnout risk', function() {
      w.burnoutRisk = 0;
      Worker.updateBurnout(w, player);
      expect(w.burnoutRisk).toBeGreaterThan(0);
    });

    it('burnout risk lessens with happiness', function() {
      w.burnoutRisk = 0;
      w.happiness = 100000000;
      Worker.updateBurnout(w, player);
      expect(w.burnoutRisk).toBe(0);
    });

    it('decreases burnout if already burntout', function() {
      w.burnout = 2;
      Worker.updateBurnout(w, player);
      expect(w.burnout).toEqual(1);
    });

    it('disables employee contributions if burnout', function() {
      player.company.workers.push(w);
      _.each(['productivity', 'happiness', 'design', 'marketing', 'engineering'], function(name) {
        w.burnout = 0;
        var val = player.company[name];
        w.burnout = 2;
        expect(player.company[name]).toBeLessThan(val);
      });
    });
  });

  describe('min salary', function() {
    it('is affected by the economy', function() {
      player.economy = 1;
      var minSalary = Worker.minSalary(w, player);

      player.economy = 2;
      expect(Worker.minSalary(w, player)).toBeGreaterThan(minSalary);
    });

    it('is affected by wage multiplier', function() {
      player.wageMultiplier = 1;
      var minSalary = Worker.minSalary(w, player);

      player.wageMultiplier = 2;
      expect(Worker.minSalary(w, player)).toBeGreaterThan(minSalary);
    });

    it('is affected by own bonus', function() {
      var minSalary = Worker.minSalary(w, player);

      w.attributes.push('Passionate');
      expect(Worker.minSalary(w, player)).toBeLessThan(minSalary);
    });
  });

});

