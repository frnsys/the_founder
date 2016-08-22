import 'pixi';
import 'p2';
import * as Phaser from 'phaser';
import Player from './Player';
import Company from 'game/Company';
import Mentor from 'views/Mentor';
import onboarding from 'data/onboarding.json';

const width = 1280 * 2; // should be width of main element times 2
const height = 1160;

// singleton
const Manager = {
  States: {},
  game: new Phaser.Game(width, height, Phaser.AUTO, 'game'),
  save: function() {
    localStorage.setItem('saveGame', JSON.stringify(this.player));
  },
  load: function() {
    var player = JSON.parse(localStorage.getItem('saveGame'));
    player.company = Company.fromJSON(player.company, player);
    this.player = Player.fromJSON(player);
    this.player.save = this.save.bind(this);
    this.player.onboard = this.onboard.bind(this);
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
    this.player.onboard = this.onboard.bind(this);
  },
  onboard: function(tag) {
    if (!this.player.onboarding[tag]) {
      Mentor.show(onboarding[tag]);
      this.player.onboarding[tag] = true;
    }
  },
  gameOver: function() {
    localStorage.setItem('newGamePlus', this.player.company.cash.toString());
    this.game.state.start('Boot');
  },
  newGamePlusCash: function() {
    return parseInt(localStorage.getItem('newGamePlus'));
  }
};

export default Manager;
