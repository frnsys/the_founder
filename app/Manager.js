/*
 * Manager
 * - handles new games
 * - handles saving & loading
 */

import 'pixi';
import 'p2';
import _ from 'underscore';
import * as Phaser from 'phaser';
import Player from './Player';
import Company from 'game/Company';
import Onboarding from './Onboarding';

const width = 1280 * 2; // should be width of main element times 2
const height = 1160;
const ignoreKeys = ['company', 'onboarder', 'player'];

function extractData(obj) {
  return _.reduce(_.keys(obj), function(o, k) {
    var val = obj[k];
    if (!_.isFunction(val) && !_.contains(ignoreKeys, k)) {
      o[k] = val;
    }
    return o;
  }, {});
}

// singleton
const Manager = {
  game: new Phaser.Game(width, height, Phaser.AUTO, 'game', null, true),
  save: function() {
    // juggle some properties to avoid circular refs
    var playerData = extractData(this.player),
        companyData = extractData(this.player.company);
    localStorage.setItem('saveGame', JSON.stringify({
      player: playerData,
      company: companyData
    }));
    var lifetimeProfit = this.player.company.lifetimeRevenue - this.player.company.lifetimeCosts,
        highScore = this.highScore();
    if (lifetimeProfit > highScore) {
      localStorage.setItem('highScore', lifetimeProfit.toString());
    }
  },
  load: function() {
    var data = JSON.parse(localStorage.getItem('saveGame'));
    this.player = new Player(data.player, data.company);
    this.player.save = this.save.bind(this);
    this.player.onboarder = new Onboarding(this);
  },
  hasSave: function() {
    return localStorage.getItem('saveGame') !== null;
  },
  hasNewGamePlus: function() {
    return localStorage.getItem('newGamePlus') !== null;
  },
  newGame: function(companyName) {
    this.player = new Player({}, {
      name: companyName
    });
    this.player.save = this.save.bind(this);
    this.player.onboarder = new Onboarding(this);
  },
  gameOver: function() {
    localStorage.setItem('newGamePlus', this.player.company.cash.toString());
    var lifetimeProfit = this.player.company.lifetimeRevenue - this.player.company.lifetimeCosts,
        highScore = this.highScore();
    if (lifetimeProfit > highScore) {
      localStorage.setItem('highScore', lifetimeProfit.toString());
    }
    localStorage.setItem('newGamePlus', this.player.company.cash.toString());
    this.game.state.start('Boot');
  },
  newGamePlusCash: function() {
    return parseInt(localStorage.getItem('newGamePlus'));
  },
  highScore: function() {
    var highScore = localStorage.getItem('highScore');
    if (highScore) {
      highScore = parseInt(highScore);
    } else {
      highScore = 0;
    }
    return highScore;
  }
};

export default Manager;
