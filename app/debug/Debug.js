import _ from 'underscore';
import util from 'util';
import OfficeDebugger from './Office';
import verticals from 'data/verticals.json';
import locations from 'data/locations.json';
import cofounders from 'data/cofounders.json';
import onboarding from 'data/onboarding.json';
import productTypes from 'data/productTypes.json';
import specialProjects from 'data/specialProjects.json';

const Debug = {
  setupCompany: function(player) {
    player.company.verticals = util.byNames(verticals, ['Information', 'Hardware']);
    player.company.cash = 20000000
    player.unlocked.specialProjects = util.byNames(specialProjects, ['Mars Colony']);
    player.company.locations = util.byNames(locations, ['New York']);
    player.company.cofounder = cofounders[0];
    player.company.workers.push(player.workers[0]);
    player.company.workers.push(player.workers[1]);
    player.company.workers.push(player.workers[2]);
    player.company.workers.push(player.workers[3]);
    player.company.workers.push(player.workers[4]);
    player.company.workers.push(player.workers[5]);
    player.company.workers[0].salary = 80000;
    // player.company.workers[0].productivity = 80000;
    player.company.discoveredProducts = ['AI.Defense', 'Gadget.Space', 'Entertainment.Space'];
    player.company.productTypes = util.byNames(productTypes, ['Ad', 'AI', 'Gadget', 'Analytics']);
    // player.company.activeProducts = [{
    //   name: 'TEST',
    //   revenue: 1000000,
    //   earnedRevenue: 0
    // }];
    player.skipOnboarding();
    player.specialEffects['Worker Insight'] = true;
  },

  debugOffice: function(office) {
    var officeDebugger = new OfficeDebugger(office);
    officeDebugger.debug();
  }
};

export default Debug;
