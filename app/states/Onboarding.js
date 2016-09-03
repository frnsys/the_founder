/*
 * Onboarding
 * - manages new company setup
 */

import 'pixi';
import 'p2';
import * as Phaser from 'phaser';
import $ from 'jquery';
import _ from 'underscore';
import util from 'util';
import OnboardingView from 'views/Onboarding';
import locations from 'data/locations.json';
import verticals from 'data/verticals.json';
import cofounders from 'data/cofounders.json';

class Onboarding extends Phaser.State {
  constructor(game, player) {
    super();
    this.game = game;
    this.player = player;
  }

  create() {
    var startingProductTypes = {
      'Hardware': ['Gadget', 'Mobile'],
      'Information': ['Social Network', 'E-Commerce']
    };
    var stages = [{
      name: 'Articles of Incorporation',
      description: 'What will you name your company?',
      options: null,
      selected: ''
    }, {
      name: 'Location',
      description: 'Where will your company be headquartered?',
      options: util.byNames(locations, ['New York', 'Boston', 'San Francisco']),
      selected: null
    }, {
      name: 'Vertical',
      description: 'What will your company specialize in?',
      options: _.map(util.byNames(verticals, ['Hardware', 'Information']), function(v) {
        var v = _.clone(v);
        v.description = `${v.description}<br><br>Starting product types: ${startingProductTypes[v.name].join(', ')}`;
        return v;
      }),
      startingProductTypes: startingProductTypes,
      selected: null
    }, {
      name: 'Cofounder',
      description: 'Who will be your cofounder?',
      options: cofounders,
      selected: null
    }, {
      name: 'Does this sound good?',
      options: [null, null, null]
    }];

    var self = this;
    var view = new OnboardingView(this.player, stages, function() {
      self.game.state.start('Manage');
    });
    view.render();
  }
}

export default Onboarding;
