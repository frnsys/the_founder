/*
 * Onboarding
 * - manages new company setup
 */

import 'pixi';
import 'p2';
import * as Phaser from 'phaser';
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
    var stages = [{
      name: 'Articles of Incorporation',
      description: 'What will you name your company?',
      options: null,
      selected: ''
    }, {
      name: 'Location',
      description: 'Where will your company be headquartered?',
      options: byNames(locations, ['New York', 'Boston', 'San Francisco']),
      selected: null
    }, {
      name: 'Vertical',
      description: 'What will your company specialize in?',
      options: byNames(verticals, ['Hardware', 'Information']),
      startingProductTypes: {
        'Hardware': ['Gadget', 'Mobile'],
        'Information': ['Social Network', 'E-Commerce']
      },
      selected: null
    }, {
      name: 'Cofounder',
      description: 'Who will your cofounder be?',
      options: cofounders,
      selected: null
    }, {
      name: 'Does this sound good?',
      options: [null, null, null]
    }];

    var self = this;
    var view = new OnboardingView(this.player, stages, function() {
        self.game.state.start('Overview');
    });
  }
}

export default Onboarding;
