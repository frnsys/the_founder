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
      selected: '',
      mentor: [
        'First off, what will you call your company?',
        'If you\'re stuck, try dropping some vowels or using an onomatopoeia.'
      ],
      mentored: false
    }, {
      name: 'Vertical',
      description: 'What will your company specialize in?',
      options: _.map(util.byNames(verticals, ['Hardware', 'Information']), function(v) {
        var v = _.clone(v);
        v.description = `${v.description}<br><br>Starting product types: ${startingProductTypes[v.name].join(', ')}`;
        return v;
      }),
      startingProductTypes: startingProductTypes,
      selected: null,
      mentor: [
        'Now you have to choose the kind of business you want to create.',
        'Remember that a lot of companies start out doing one thing and grow to do many.'
      ],
      mentored: false
    }, {
      name: 'Location',
      description: 'Where will your company be headquartered?',
      options: util.byNames(locations, ['New York', 'Boston', 'San Francisco']),
      selected: null,
      mentor: [
        'Next, where do you want to base your company?',
        'Locations can have different bonuses and give access to different markets.'
      ],
      mentored: false
    }, {
      name: 'Cofounder',
      description: 'Who will be your cofounder?',
      options: cofounders,
      selected: null,
      mentor: [
        'Finally, there\'s no way you\'ll be able to do this alone. You need a cofounder.',
        'Picking the cofounder is one of the most important decisions for a business.',
        'They vary in what they can bring to the table. You\'ll want to pick one that reflects your own skill set.'
      ],
      mentored: false
    }, {
      name: 'Does this sound good?',
      options: [null, null, null],
      mentor: [
        'If this all looks good to you, we\'ll get going!'
      ],
      mentored: false
    }];

    var self = this;
    var view = new OnboardingView(this.player, stages, function() {
      self.game.state.start('Manage');
    });
    view.render();
  }
}

export default Onboarding;
