import _ from 'underscore';
import Player from 'app/Player';

var worker = {
  "marketing": 10,
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
      "hype": 1
    };
  });

  it('can be bought', function() {
    expect(company.promo).toEqual(null);
    company.buyPromo(promo);
    expect(company.promo.name).toEqual(promo.name);
  });

  it('is developed with productivity and marketing', function() {
    company.buyPromo(promo);
    expect(company.hype).toEqual(0);
    expect(company.promo.progress).toEqual(0);
    expect(company.promo.requiredProgress).toEqual(1000);

    company.developPromo();
    expect(company.promo.progress).toEqual(501);
    expect(company.hype).toBeGreaterThan(0);
  });

  it('adds hype when finished', function() {
    var val = company.hype;
    company.buyPromo(promo);

    company.developPromo();
    company.developPromo();
    expect(company.promo).toEqual(null);
    expect(company.hype).toBeGreaterThan(val);
  });

  it('adds more hype with more marketing', function() {
    var diff, val = company.hype;
    company.buyPromo(promo);
    _.times(2, company.developPromo.bind(company));
    company.developPromo();
    diff = company.hype - val;

    company.cash = promo.cost;
    company.hype = val;
    company.buyPromo(promo);
    company.workers[0].marketing = 100;
    _.times(2, company.developPromo.bind(company));
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


