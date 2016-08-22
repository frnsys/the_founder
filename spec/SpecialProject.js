import _ from 'underscore';
import Company from 'game/Company';

describe('SpecialProject', function() {
  var company, specialProject;
  beforeEach(function() {
    company = new Company({cash: 10000});
    company.player.specialEffects = {
      Prescient: false
    };
    specialProject = {
      "name": "Delphi",
      "cost": 10000,
      "description": "State-of-the-art market prediction algorithms.",
      "effects": [{
        "type": "specialEffect",
        "value": "Prescient"
      }],
      "requiredProducts": ["Analytics.Credit", "Analytics.Defense", "Analytics.Social Network"]
    };
  });

  it('requires required products', function() {
    company.discoveredProducts = [];
    expect(company.specialProjectIsAvailable(specialProject)).toEqual(false);
    expect(company.buySpecialProject(specialProject)).toEqual(false);
    company.discoveredProducts = specialProject.requiredProducts;
    expect(company.specialProjectIsAvailable(specialProject)).toEqual(true);
    expect(company.buySpecialProject(specialProject)).toEqual(true);
  });

  describe('when bought', function() {
    it('saves the special project', function() {
      expect(company.specialProjects.length).toEqual(0);
      company.discoveredProducts = specialProject.requiredProducts;
      company.buySpecialProject(specialProject);
      expect(company.specialProjects.length).toEqual(1);
      expect(company.specialProjects[0].name).toEqual("Delphi");
    });

    it('has company-wide effects', function() {
      company.discoveredProducts = specialProject.requiredProducts;
      company.buySpecialProject(specialProject);
      expect(company.player.specialEffects['Prescient']).toEqual(true);
    });
  });
});


