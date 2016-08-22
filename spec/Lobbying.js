import _ from 'underscore';
import Company from 'game/Company';

describe('Lobbying', function() {
  var company, lobby;
  beforeEach(function() {
    company = new Company({cash:100000});
    lobby = {
      "name": "Foreign Intervention",
      "cost": 100000,
      "description": "blah",
      "effects": [{
        "type": "expansionCostMultiplier",
        "value": -0.05
      }]
    };
  });

  describe('when bought', function() {
    it('saves the lobby', function() {
      expect(company.lobbies.length).toEqual(0);
      company.buyLobby(lobby);
      expect(company.lobbies.length).toEqual(1);
      expect(company.lobbies[0].name).toEqual("Foreign Intervention");
    });

    it('has company-wide effects', function() {
      company.player.expansionCostMultiplier = 1;
      company.buyLobby(lobby);
      expect(company.player.expansionCostMultiplier).toEqual(0.95);
    });
  });
});


