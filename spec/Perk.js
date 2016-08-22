import _ from 'underscore';
import Perk from 'game/Perk';
import Company from 'game/Company';

describe('Perk', function() {
  var company, perk;
  beforeEach(function() {
    company = new Company({cash: 10000});
    perk = {
      "name": "Simple Perk",
      "upgradeLevel": 0,
      "upgrades": [{
        "name": "Upgrade1",
        "description": "blah",
        "cost": 5000,
        "requiredOffice": 0,
        "requiredTechs": [],
        "effects": [{
          "type": "happiness",
          "value": 1
        }],
        "stats": {
          "Perks perked": [0.5, 10]
        }
      }, {
        "name": "Upgrade2",
        "description": "blah",
        "cost": 1000,
        "requiredOffice": 0,
        "requiredTechs": [],
        "effects": [{
          "type": "happiness",
          "value": 2
        }]
      }]
    };
  });

  it('checks next upgrade', function() {
    expect(Perk.hasNext(perk)).toEqual(true);

    perk.upgradeLevel = 1;
    expect(Perk.hasNext(perk)).toEqual(false);
  });

  it('gets next upgrade', function() {
    expect(Perk.next(perk).name).toEqual('Upgrade2');

    perk.upgradeLevel = 1;
    expect(Perk.next(perk)).toEqual(null);
  });

  it('gets current upgrade', function() {
    expect(Perk.current(perk).name).toEqual('Upgrade1');

    perk.upgradeLevel = 1;
    expect(Perk.current(perk).name).toEqual('Upgrade2');
  });

  it('checks company office level for upgrade', function() {
    perk = perk.upgrades[0];
    perk.requiredOffice = 3;
    perk.requiredTechs = [];

    company.office = 2;
    expect(Perk.isAvailable(perk, company)).toEqual(false);

    company.office = 3;
    expect(Perk.isAvailable(perk, company)).toEqual(true);
  });

  it('checks company techs for upgrade', function() {
    perk = perk.upgrades[0];
    perk.requiredTechs = ['Neuromorphic Chips'];
    perk.requiredOffice = 0;

    company.technologies = [];
    expect(Perk.isAvailable(perk, company)).toEqual(false);

    company.technologies = [{name: 'Neuromorphic Chips'}];
    expect(Perk.isAvailable(perk, company)).toEqual(true);
  });

  it('generates stats', function() {
    // so the company has one worker
    company.workers = [{}];

    var stats = Perk.computeStats(perk, company),
        value = stats['Perks perked'];

    expect(value >= 1 && value <= 11).toEqual(true);
  });

  describe('when bought', function() {
    it('saves the perk', function() {
      expect(company.perks.length).toEqual(0);
      company.buyPerk(perk);
      expect(company.perks.length).toEqual(1);
      expect(company.perks[0].name).toEqual("Simple Perk");
    });

    it('upgrades an existing perk', function() {
      company.buyPerk(perk);
      expect(company.perks[0].upgradeLevel).toEqual(0);
      company.buyPerk(perk);
      expect(company.perks[0].upgradeLevel).toEqual(1);
    });

    it('has company-wide effects', function() {
      expect(company.happiness).toEqual(1);
      company.buyPerk(perk);
      expect(company.happiness).toEqual(2);
      company.buyPerk(perk);
      expect(company.happiness).toEqual(4);
    });
  });
});
