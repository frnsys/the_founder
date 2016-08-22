import _ from 'underscore';
import Company from 'game/Company';

describe('Vertical', function() {
  var company, vertical;
  beforeEach(function() {
    company = new Company({cash: 10000});
    vertical = {
      "name": "Defense",
      "cost": 1000,
      "description": "blah"
    };
  });

  describe('when bought', function() {
    it('saves the vertical', function() {
      expect(company.verticals.length).toEqual(0);
      company.buyVertical(vertical);
      expect(company.verticals.length).toEqual(1);
      expect(company.verticals[0].name).toEqual('Defense');
    });
  });
});

