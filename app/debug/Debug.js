/*
 * Debug
 * - sets up a company to test with
 * - other debugging stuff
 */

import _ from 'underscore';
import util from 'util';
import Product from 'game/Product';
import OfficeDebugger from './Office';
import verticals from 'data/verticals.json';
import locations from 'data/locations.json';
import cofounders from 'data/cofounders.json';
import onboarding from 'data/onboarding.json';
import productTypes from 'data/productTypes.json';
import specialProjects from 'data/specialProjects.json';

var testProduct = {
  name: 'test product',
  recipeName: 'Bleep.Bloop',
  difficulty: 2,
  killsPeople: true,
  debtsPeople: true,
  pollutes: true,
  productTypes: ['Bleep', 'Bloop'],
  verticals: ['B', 'P'],
  effects: [],
  marketing: 10,
  engineering: 10,
  design: 10,
  feature: 1,
  description: 'for testing purposes. not for individual resale.',
  combo: 'Bleep + Bloop',
  progress: 1,
  requiredProgress: 1,
  levels: {
    quantity: 1,
    strength: 1,
    movement: 1
  }
};



const Debug = {
  setupCompany: function(player) {
    player.company.verticals = util.byNames(verticals, ['Information']);
    // player.company.verticals = util.byNames(verticals, ['Information', 'Hardware']);
    player.company.cash = 100000
    // player.unlocked.specialProjects = util.byNames(specialProjects, ['Mars Colony']);
    player.unlocked.specialProjects = specialProjects;
    player.company.locations = util.byNames(locations, ['New York']);
    player.company.cofounder = cofounders[0];
    player.company.workers = player.workers.slice(0,3);
    // _.each(player.company.workers, w => w.salary = 40000);
    // player.company.discoveredProducts = ['AI.Defense', 'Gadget.Space', 'Entertainment.Space'];
    // player.company.productTypes = util.byNames(productTypes, ['Ad', 'AI', 'Gadget', 'Analytics']);
    player.company.productTypes = _.map(
      util.byNames(productTypes, ['Social Network', 'E-Commerce', 'Ad']),
      pt => Product.initType(pt));
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
  },

  debugMarket: function(game) {
    game.state.start('Market', true, false, testProduct);
  }
};

export default Debug;
