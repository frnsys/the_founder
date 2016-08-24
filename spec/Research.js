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

describe('Research', function() {
  var player, company, tech;
  beforeEach(function() {
    player = new Player({}, {cash: 1000});
    company = player.company;
    company.workers = [worker];
    tech = {
      "name": "3D Printing",
      "description": "Print endless plastic trinkets",
      "cost": 1000,
      "requiredVertical": "Hardware",
      "requiredTechs": ["Something Required"],
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
      var val = company.productivity;
      company.verticals = [{name: "Hardware"}];
      company.technologies = _.map(tech.requiredTechs, i => ({name: i}));
      company.buyResearch(tech);
      expect(company.productivity).toEqual(val+1);
    });
  });
});



