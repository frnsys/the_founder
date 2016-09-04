import _ from 'underscore';
import Player from 'app/Player';

describe('Location', function() {
  var player, company, location;
  beforeEach(function() {
    player = new Player({}, {cash:10000});
    company = player.company;
    location = {
      "name": "Bangalore",
      "cost": 10000,
      "effects": [{
          "type": "productivity",
          "value": 1
      }],
      "market": "Asia",
      "size": 1,
      "skills": {
        "productivity": 10,
        "happiness": 10,
        "design": 10,
        "marketing": 10,
        "engineering": 10
      }
    };
  });

  describe('when bought', function() {
    it('saves the location', function() {
      expect(company.locations.length).toEqual(0);
      company.buyLocation(location);
      expect(company.locations.length).toEqual(1);
      expect(company.locations[0].name).toEqual('Bangalore');
    });

    it('has company-wide effects', function() {
      expect(company.productivity).toEqual(0);
      company.buyLocation(location);
      expect(company.productivity).toEqual(1 + 1 + location.skills.productivity);
    });

    it('gives access to new markets', function() {
      expect(company.markets.length).toEqual(0);
      company.buyLocation(location);
      expect(company.markets.length).toEqual(1);
      expect(company.markets[0]).toEqual('Asia');
    });

    it('costs rent', function() {
      company.player.costMultiplier = 1;
      expect(company.rent).toEqual(0);
      company.buyLocation(location);
      expect(company.rent).toBeGreaterThan(0);
    });

    it('has rent influenced by cost multiplier', function() {
      company.buyLocation(location);
      company.player.costMultiplier = 1;
      var rent = company.rent;
      company.player.costMultiplier = 2;
      expect(company.rent).toBeGreaterThan(rent);
    });

    it('adds skills to the company', function() {
      expect(company.design).toEqual(0);
      expect(company.engineering).toEqual(0);
      expect(company.marketing).toEqual(0);
      expect(company.happiness).toEqual(0);
      expect(company.productivity).toEqual(0);
      company.buyLocation(location);
      expect(company.design).toEqual(11);
      expect(company.engineering).toEqual(11);
      expect(company.marketing).toEqual(11);
      expect(company.productivity).toEqual(11 + 1); // +1 for bonus
      expect(company.happiness).toEqual(11);
    });
  });

});

