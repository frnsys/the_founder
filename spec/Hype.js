import _ from 'underscore';
import Player from 'app/Player';

var worker = {
  "design": 10,
  "marketing": 10,
  "engineering": 10,
  "productivity": 500,
  "attributes": []
}

describe('Hype', function() {
  var player, company, promo;
  beforeEach(function() {
    player = new Player({}, {cash:10000});
    company = player.company;
    company.workers.push(worker)
    promo = {
      "name": "Press Release",
      "cost": 10000,
      "description": "Email a few publications",
      "power": 1
    };
  });

  it('can be started', function() {
    expect(company.tasks.length).toEqual(0);
    var task = company.startPromo(promo);
    company.startTask(task, company.workers, []);
    expect(company.tasks.length).toEqual(1);
    expect(company.tasks[0].obj.name).toEqual(promo.name);
    expect(company.workers[0].task).toEqual(company.tasks[0].id);
  });

  it('is developed with productivity and marketing', function() {
    var task = company.startPromo(promo);
    company.startTask(task, company.workers, []);
    expect(task.obj.hype).toEqual(0);
    expect(task.progress).toEqual(0);
    expect(task.requiredProgress).toEqual(100);

    company.develop();
    expect(task.progress).toEqual(501);
    expect(task.obj.hype).toBeGreaterThan(0);
  });

  it('adds hype when finished', function() {
    var val = company.hype;
    var task = company.startPromo(promo);
    company.startTask(task, company.workers, []);
    _.times(2, company.develop.bind(company));
    expect(company.tasks.length).toEqual(0);
    expect(company.hype).toBeGreaterThan(val);
  });

  it('adds more hype with more marketing', function() {
    var diff, val = company.hype;
    var task = company.startPromo(promo);
    company.startTask(task, company.workers, []);
    _.times(2, company.develop.bind(company));
    diff = company.hype - val;

    company.cash = promo.cost;
    company.hype = val;
    var task = company.startPromo(promo);
    company.startTask(task, company.workers, []);
    company.workers[0].marketing = 100;
    _.times(2, company.develop.bind(company));
    expect(company.hype - val).toBeGreaterThan(diff);
  });

  it('adds more hype with more design', function() {
    var diff, val = company.hype;
    var task = company.startPromo(promo);
    company.startTask(task, company.workers, []);
    _.times(2, company.develop.bind(company));
    diff = company.hype - val;

    company.cash = promo.cost;
    company.hype = val;
    var task = company.startPromo(promo);
    company.startTask(task, company.workers, []);
    company.workers[0].design = 100;
    _.times(2, company.develop.bind(company));
    expect(company.hype - val).toBeGreaterThan(diff);
  });

  it('adds more hype with more power', function() {
    var diff, val = company.hype;
    var task = company.startPromo(promo);
    company.startTask(task, company.workers, []);
    _.times(2, company.develop.bind(company));
    diff = company.hype - val;

    promo.power = 2;
    company.cash = promo.cost;
    company.hype = val;
    var task = company.startPromo(promo);
    company.startTask(task, company.workers, []);
    _.times(4, company.develop.bind(company));
    expect(company.hype - val).toBeGreaterThan(diff);
  });

  describe('decay', function() {
    it('decays hype over time', function() {
      company.hype = 1000;
      company.decayHype();
      expect(company.hype).toBeLessThan(1000);
    });

    it('decays outrage over time', function() {
      company.outrage = 1000;
      company.decayHype();
      expect(company.outrage).toBeLessThan(1000);
    });

    it('decays more with outrage', function() {
      var diff, startVal = 1000;
      company.hype = startVal;
      company.outrage = 0;
      company.decayHype();
      diff = startVal - company.hype;

      company.hype = startVal;
      company.outrage = 1000;
      company.decayHype();
      expect(startVal - company.hype).toBeGreaterThan(diff);
    });

    it('decays less with higher forgetting rate', function() {
      var diff, startVal = 1000;
      company.hype = startVal;
      company.outrage = 1000;
      company.player.forgettingRate = 1;
      company.decayHype();
      diff = startVal - company.hype;

      company.hype = startVal;
      company.outrage = 1000;
      company.player.forgettingRate = 1.5;
      expect(startVal - company.hype).toBeLessThan(diff);
    });

    it('increases outrage by negative company values', function() {
      var val = company.outrage;
      company.deathToll = 1000;
      company.pollution = 1000;
      company.debtOwned = 1000;
      company.taxesAvoided = 1000;
      company.decayHype();
      expect(company.outrage).toBeGreaterThan(val);
    });
  });
});


