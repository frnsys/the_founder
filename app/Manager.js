import 'pixi';
import 'p2';
import * as Phaser from 'phaser';
import Player from './Player';
import Company from 'game/Company';
import Onboarding from './Onboarding';

const width = 1280 * 2; // should be width of main element times 2
const height = 1160;

// singleton
const Manager = {
  States: {},
  game: new Phaser.Game(width, height, Phaser.AUTO, 'game', null, true),
  save: function() {
    localStorage.setItem('saveGame', JSON.stringify(this.player));
  },
  load: function() {
    var player = JSON.parse(localStorage.getItem('saveGame'));
    player.company = Company.fromJSON(player.company, player);
    this.player = Player.fromJSON(player);
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
      highscore = parseInt(highscore);
    } else {
      highScore = 0;
    }
    return highScore;
  }
};

export default Manager;
