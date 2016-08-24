import _ from 'underscore';
import Manager from 'app/Manager';

var worker = {
  "avatar": 1,
  "design": 1,
  "engineering": 1,
  "happiness": 1,
  "marketing": 1,
  "minSalary": 45000,
  "name": "Noe Sumner",
  "productivity": 1,
  "title": "Programmer",
  "attributes": [
    "Team Player",
    "Go-Getter",
    "Driven"
  ]
}

describe('Saving', function() {
  beforeEach(function() {
    Manager.newGame('DEFAULTCORP');
    Manager.player.company.hireEmployee(worker, 1000);
  });

  it('saves the game', function() {
    Manager.player.save();
    expect(Manager.hasSave()).toEqual(true);
  });

  it('loads the game', function() {
    Manager.player.age = 100;
    Manager.player.company.cash = 200;
    Manager.player.save();
    Manager.player = null;

    Manager.load();
    expect(Manager.player.age).toEqual(100);
    expect(Manager.player.company.cash).toEqual(200);
  });
});

