import _ from 'underscore';
import Company from 'game/Company';

describe('SpecialProject', function() {
  var company, specialProject;
  beforeEach(function() {
    var worker = {
      "design": 10,
      "marketing": 10,
      "engineering": 10,
      "productivity": 500,
      "attributes": []
    };
    company = new Company({cash: 10000});
    company.player.specialEffects = {
      Prescient: false
    };
    company.workers.push(worker);
    specialProject = {
      "name": "Delphi",
      "cost": 10000,
      "description": "State-of-the-art market prediction algorithms.",
      "effects": [{
        "type": "specialEffect",
        "value": "Prescient"
      }],
      "requiredProducts": ["Analytics.Credit", "Analytics.Defense", "Analytics.Social Network"],
      "required": {
        "design": 100,
        "marketing": 100,
        "engineering": 100
      }
    };
  });

  it('requires required products', function() {
    company.discoveredProducts = [];
    expect(company.specialProjectIsAvailable(specialProject)).toEqual(false);
    expect(company.startSpecialProject(specialProject)).toEqual(false);
    company.discoveredProducts = specialProject.requiredProducts;
    expect(company.specialProjectIsAvailable(specialProject)).toEqual(true);
    expect(company.startSpecialProject(specialProject)).not.toEqual(false);
  });

  it('can be started', function() {
    expect(company.tasks.length).toEqual(0);
    company.discoveredProducts = specialProject.requiredProducts;
    var task = company.startSpecialProject(specialProject);
    company.startTask(task, company.workers, []);
    expect(company.tasks.length).toEqual(1);
    expect(company.tasks[0].obj.name).toEqual(specialProject.name);
    expect(company.workers[0].task).toEqual(company.tasks[0].id);
  });

  it('increases stats when developed', function() {
    company.discoveredProducts = specialProject.requiredProducts;
    var task = company.startSpecialProject(specialProject);
    company.startTask(task, company.workers, []);
    _.each(['design', 'engineering', 'marketing'], function(n) {
      expect(task.obj[n]).toEqual(0);
    });
    company.develop();
    _.each(['design', 'engineering', 'marketing'], function(n) {
      expect(task.obj[n]).toBeGreaterThan(0);
    });
  });

  it('is saved when developed', function() {
    expect(company.specialProjects.length).toEqual(0);
    company.discoveredProducts = specialProject.requiredProducts;
    var task = company.startSpecialProject(specialProject);
    company.startTask(task, company.workers, []);
    company.develop();
    expect(company.specialProjects.length).toEqual(1);
    expect(company.specialProjects[0].name).toEqual("Delphi");
  });

  it('has company-wide effects', function() {
    company.discoveredProducts = specialProject.requiredProducts;
    var task = company.startSpecialProject(specialProject);
    company.startTask(task, company.workers, []);
    company.develop();
    expect(company.player.specialEffects['Prescient']).toEqual(true);
  });
});


