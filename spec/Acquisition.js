import _ from 'underscore';
import Player from 'app/Player';

var worker = {
  "design": 1,
  "engineering": 1,
  "happiness": 1,
  "marketing": 1,
  "productivity": 1,
  "attributes": []
}

describe('Acquisition', function() {
  var player, company, acquisition, competitor;
  beforeEach(function() {
    player = new Player({}, {cash: 100000});
    company = player.company;
    company.workers = [worker];
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
      expect(company.productivity).toEqual(2);
      company.buyAcquisition(acquisition);
      expect(company.productivity).toEqual(2+10);
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

