import _ from 'underscore';
import Company from 'game/Company';

describe('Location', function() {
  var company, location;
  beforeEach(function() {
    company = new Company({cash: 10000});
    location = {
      "name": "Bangalore",
      "cost": 10000,
      "effects": [{
          "type": "happiness",
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
      expect(company.happiness).toEqual(1);
      company.buyLocation(location);
      expect(company.happiness).toEqual(1 + 1 + location.skills.happiness);
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
      expect(company.design).toEqual(1);
      expect(company.engineering).toEqual(1);
      expect(company.marketing).toEqual(1);
      expect(company.happiness).toEqual(1);
      expect(company.productivity).toEqual(1);
      company.buyLocation(location);
      expect(company.design).toEqual(11);
      expect(company.engineering).toEqual(11);
      expect(company.marketing).toEqual(11);
      expect(company.happiness).toEqual(11 + 1); // +1 for bonus
      expect(company.productivity).toEqual(11);
    });
  });

});

