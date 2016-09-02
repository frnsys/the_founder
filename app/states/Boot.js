/*
 * Boot
 * - initialization state of the game
 */

import 'pixi';
import 'p2';
import * as Phaser from 'phaser';
import $ from 'jquery';
import _ from 'underscore';
import Debug from 'debug/Debug';
import Manager from 'app/Manager';
import Manage from 'states/Manage';
import Market from 'states/Market';
import MainMenu from 'views/MainMenu';
import Onboarding from 'states/Onboarding';

const DEBUG = false;
const DEBUG_MARKET = false;

class Boot extends Phaser.State {
  preload() {
    // retina support
    this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    this.game.scale.setUserScale(0.5, 0.5);
    this.game.canvas.id = 'market';
    $(this.game.canvas).appendTo('main');
  }

  create() {
    Manager.newGame('DEFAULTCORP');

    if (DEBUG) {
      Debug.setupCompany(Manager.player);
    }

    var game = Manager.game,
        player = Manager.player;
    game.state.add('Manage', new Manage(game, player, DEBUG));
    game.state.add('Market', new Market(game, player, DEBUG));
    game.state.add('Onboarding', new Onboarding(game, player));

    if (DEBUG_MARKET) {
      Debug.debugMarket(game);

    } else {
      this.game.stage.backgroundColor = $('html').css('background-color');
      $('.background').css('background-image', 'url("assets/office/apartment.jpg")').show();
      var view = new MainMenu(DEBUG);
      view.render({
        savedGame: Manager.hasSave(),
        newGamePlus: Manager.hasNewGamePlus(),
        highScore: Manager.highScore()
      });
    }
  }
}

export default Boot;
