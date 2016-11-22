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

let params = new URLSearchParams(location.search.slice(1));
let DEBUG = params.get('debug') === 'true';
let DEBUG_MARKET = params.get('debug_market') === 'true';

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
      window.player = Manager.player;
      window.company = Manager.player.company;
    }

    var game = Manager.game,
        player = Manager.player;
    game.state.add('Manage', new Manage(game, player, DEBUG));
    game.state.add('Market', new Market(game, player, DEBUG));
    game.state.add('Onboarding', new Onboarding(game, player));

    if (DEBUG_MARKET) {
      player.seenMarket = false;
      Debug.debugMarket(game, player);

    } else {
      var view = new MainMenu(Manager, DEBUG);
      view.render();
    }

    // CHEAT CODES!!
    window.cheat = {
      windfall: function(amt) {
        player.company.cash += amt || 1000000;
      },
      crushit: function(lvl) {
        var lvl = lvl || 50;
        _.each(player.company.workers, w => {
          w.productivity = lvl;
          w.happiness = lvl;
          w.engineering = lvl;
          w.marketing = lvl;
          w.design = lvl;
        });
      },
      opensesame: function() {
        Debug.unlockAll(player);
      },
      fucktheplanet: function(n_pollution) {
        player.company.pollution = n_pollution;
      }
    }
  }
}

export default Boot;
