import _ from 'underscore';
import Player from 'app/Player';


describe('Lobbying', function() {
  var player, company, lobby;
  beforeEach(function() {
    var worker = {
      "design": 10,
      "marketing": 10,
      "engineering": 10,
      "productivity": 500,
      "attributes": []
    };
    player = new Player({}, {cash:100000});
    company = player.company;
    company.workers.push(worker)
    lobby = {
      "name": "Foreign Intervention",
      "cost": 100000,
      "description": "blah",
      "requiredProgress": 500,
      "effects": [{
        "type": "expansionCostMultiplier",
        "value": -0.05
      }]
    };
  });

  it('can be started', function() {
    expect(company.tasks.length).toEqual(0);
    var task = company.startLobby(lobby);
    company.startTask(task, company.workers, []);
    expect(company.tasks.length).toEqual(1);
    expect(company.tasks[0].obj.name).toEqual(lobby.name);
    expect(company.workers[0].task).toEqual(company.tasks[0].id);
  });

  it('increases progress when developed', function() {
    var task = company.startLobby(lobby);
    company.startTask(task, company.workers, []);
    company.workers[0].productivity = 1; // so we don't finish developing it
    expect(company.tasks[0].progress).toEqual(0);
    company.develop();
    expect(company.tasks[0].progress).toBeGreaterThan(0);
  });

  it('is saved when developed', function() {
    expect(company.lobbies.length).toEqual(0);
    var task = company.startLobby(lobby);
    company.startTask(task, company.workers, []);
    company.develop();
    expect(company.lobbies.length).toEqual(1);
    expect(company.lobbies[0].name).toEqual("Foreign Intervention");
  });

  it('has company-wide effects', function() {
    company.player.expansionCostMultiplier = 1;
    var task = company.startLobby(lobby);
    company.startTask(task, company.workers, []);
    company.develop();
    expect(company.player.expansionCostMultiplier).toEqual(0.95);
  });
});


