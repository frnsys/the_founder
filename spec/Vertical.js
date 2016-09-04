import _ from 'underscore';
import Player from 'app/Player';

describe('Vertical', function() {
  var player, company, vertical;
  beforeEach(function() {
    player = new Player({}, {cash:100000});
    company = player.company;
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

