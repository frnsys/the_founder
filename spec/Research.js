import _ from 'underscore';
import Company from 'game/Company';

describe('Research', function() {
  var company, tech;
  beforeEach(function() {
    company = new Company({cash: 1000});
    tech = {
      "name": "3D Printing",
      "description": "Print endless plastic trinkets",
      "cost": 1000,
      "requiredVertical": "Hardware",
      "requiredTechs": ["Something Required"],
      "effects": [{
        "type": "happiness",
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

  describe('when bought', function() {
    it('saves the technology', function() {
      company.verticals = [{name: "Hardware"}];
      company.technologies = _.map(tech.requiredTechs, i => ({name: i}));
      expect(company.technologies.length).toEqual(tech.requiredTechs.length);
      company.buyResearch(tech);
      expect(company.technologies.length).toEqual(tech.requiredTechs.length + 1);
      expect(_.last(company.technologies).name).toEqual('3D Printing');
    });

    it('has company-wide effects', function() {
      company.verticals = [{name: "Hardware"}];
      company.technologies = _.map(tech.requiredTechs, i => ({name: i}));
      expect(company.happiness).toEqual(1);
      company.buyResearch(tech);
      expect(company.happiness).toEqual(2);
    });
  });
});



