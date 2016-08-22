import _ from 'underscore';
import Company from 'game/Company';

describe('Acquisition', function() {
  var company, acquisition, competitor;
  beforeEach(function() {
    company = new Company({cash: 100000});
    acquisition = {
      "name": "Dark Industries",
      "description": "hello darkness",
      "cost": 10000,
      "revenue": 100000,
      "effects": [{
        "type": "productivity",
        "value": 10
      }]
    };
    competitor = {
      "name": "Dark Industries",
      "description": "hello darkness",
      "disabled": false,
      "founder": "Morgane",
      "productTypes": ["Entertainment", "AI"]
    };
    company.player.competitors = [competitor];
  });

  describe('when bought', function() {
    it('saves the acquisition', function() {
      expect(company.acquisitions.length).toEqual(0);
      company.buyAcquisition(acquisition);
      expect(company.acquisitions.length).toEqual(1);
      expect(company.acquisitions[0].name).toEqual("Dark Industries");
    });

    it('has company-wide effects', function() {
      // worker bonuses all start at 1
      expect(company.productivity).toEqual(1);
      company.buyAcquisition(acquisition);
      expect(company.productivity).toEqual(11);
    });

    it('disabled associated competitor', function() {
      expect(company.player.competitors[0].disabled).toEqual(false);
      company.buyAcquisition(acquisition);
      expect(company.player.competitors[0].disabled).toEqual(true);
    });
  });

  it('generates revenue', function() {
    company.buyAcquisition(acquisition);
    company.cash = 0;
    company.harvestCompanies();
    expect(company.cash).toEqual(100000/12);
  });
});

