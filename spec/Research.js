import _ from 'underscore';
import Player from 'app/Player';


describe('Research', function() {
  var player, company, tech;
  beforeEach(function() {
    var worker = {
      "design": 1,
      "engineering": 100,
      "happiness": 1,
      "marketing": 1,
      "productivity": 1,
      "attributes": []
    }
    player = new Player({}, {cash: 1000});
    company = player.company;
    company.workers = [worker];
    tech = {
      "name": "3D Printing",
      "description": "Print endless plastic trinkets",
      "cost": 1000,
      "requiredVertical": "Hardware",
      "requiredTechs": ["Something Required"],
      "requiredProgress": 100,
      "effects": [{
        "type": "productivity",
        "value": 1
      }]
    };
  });

  it('requires a particular vertical', function() {
    company.verticals = [];
    company.technologies = _.map(tech.requiredTechs, i => ({name: i}));
    expect(company.researchIsAvailable(tech)).toEqual(false);
    company.verticals = [{name: "Hardware"}];
    expect(company.researchIsAvailable(tech)).toEqual(true);
  });

  it('requires particular technologies', function() {
    company.technologies = [];
    company.verticals = [{name: "Hardware"}];
    expect(company.researchIsAvailable(tech)).toEqual(false);
    company.technologies = _.map(tech.requiredTechs, i => ({name: i}));
    expect(company.researchIsAvailable(tech)).toEqual(true);
  });

  describe('development', function() {
    beforeEach(function() {
      company.verticals = [{name: "Hardware"}];
      company.technologies = _.map(tech.requiredTechs, i => ({name: i}));
    });

    it('can be started', function() {
      expect(company.tasks.length).toEqual(0);
      var task = company.startResearch(tech);
      company.startTask(task, company.workers, []);
      expect(company.tasks.length).toEqual(1);
      expect(company.tasks[0].obj.name).toEqual(tech.name);
      expect(company.workers[0].task).toEqual(company.tasks[0].id);
    });

    it('increases progress when developed', function() {
      var task = company.startResearch(tech);
      company.startTask(task, company.workers, []);
      company.workers[0].productivity = 1; // so we don't finish developing it
      company.workers[0].engineering = 1; // so we don't finish developing it
      expect(company.tasks[0].progress).toEqual(0);
      company.develop();
      expect(company.tasks[0].progress).toBeGreaterThan(0);
    });

    it('is saved when developed', function() {
      expect(company.technologies.length).toEqual(tech.requiredTechs.length);
      var task = company.startResearch(tech);
      company.startTask(task, company.workers, []);
      company.develop();
      expect(company.technologies.length).toEqual(tech.requiredTechs.length + 1);
      expect(_.last(company.technologies).name).toEqual('3D Printing');
    });

    it('has company-wide effects', function() {
      var val = company.productivity;
      company.verticals = [{name: "Hardware"}];
      company.technologies = _.map(tech.requiredTechs, i => ({name: i}));
      var task = company.startResearch(tech);
      company.startTask(task, company.workers, []);
      company.develop();
      expect(company.productivity).toEqual(val+1);
    });
  });
});



