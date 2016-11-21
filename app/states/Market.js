/*
 * The Market
 * - manages the initialization of The Market minigame (players, pieces, board)
 * - manages turns, game end, and UI for The Market
 */

import 'pixi';
import 'p2';
import * as Phaser from 'phaser';
import $ from 'jquery';
import _ from 'underscore';
import Tile from 'market/Tile';
import Product from 'game/Product';
import Market from 'market/Market';
import MarketView from 'views/Market';
import Confirm from 'views/alerts/Confirm';
import Alert from 'views/alerts/Alert';

const ONBOARDING = {
  welcome: '<img src="assets/onboarding/market_piece.png"><p>Welcome to <em class="special">The Market</em>! This is the magical place where you fight for <em class="special">market share</em>. To start, <em class="ui-item">click</em> one of your products (the blue sphere).</p>',
  product: '<img src="assets/onboarding/market_product.png"><p>This blue sphere is the product you just launched. Their <em class="concept">moves</em> and <em class="concept">strength</em> depend on the points you chose. <em class="ui-item">Click-and-hold</em> it to pick it up.</p>',
  movement: '<img src="assets/onboarding/market_movement.gif"><p>To move a product, <em class="ui-item">drag</em> it and then <em class="ui-item">drop</em> it onto a highlighted tile.</p>',
  capture: '<img src="assets/onboarding/market_capture.gif"><p>It\'s your turn again. <em class="ui-item">Double-click</em> on the product to <em class="concept">capture</em> the <em class="special">market share</em> tile underneath.</p>',
  tiles: '<img src="assets/onboarding/market_share.png"><p>Congrats! You captured some <em class="special">market share</em>. This will increase your product\'s <em class="concept">revenue</em>.</p>',
  tiles_more: '<img src="assets/onboarding/market_share.png"><p>It\'s your turn again. Keep capturing more <em class="special">market share</em>!</p>',
  combat: '<img src="assets/onboarding/market_combat.gif"><p>You might come head-to-head with a competing product. You can <em class="concept">fight</em> it by <em class="ui-item">dragging</em> your product on top of it.</p>',
  influencers: '<img src="assets/onboarding/market_influencer.png"><p>One last thing: you might encounter <em class="special">influencer</em> tiles. Capture these for big revenue bonuses!</p>',
  end: '<p>That\'s about it! You have a 10 turns or until you or your competitor is wiped out to capture as much <em class="special">market share</em> as you can. Good luck!</p>'
};



class TheMarket extends Phaser.State {
  constructor(game, player, debug) {
    super();
    this.game = game;
    this.player = player;
    this.debug = debug;
  }

  init(product, competitor, player) {
    this.product = product;
    this.competitor = competitor;
    this.player = player || this.player;
  }

  preload() {
    var self = this;
    this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    this.game.scale.setUserScale(0.5, 0.5);

    _.each(['emptyTile', 'influencerTile', 'income0Tile', 'income1Tile', 'income2Tile', 'income3Tile'], function(sprite) {
        self.game.load.image(sprite, 'assets/tiles/'+sprite+'.png');
     });

    this.game.load.image('productPiece', 'assets/themarket/product.png');
    this.game.load.image('captureFlag', 'assets/themarket/flag.png');
  }

  create() {
    $('#office').hide();
    $('#market').show().addClass('market-active');
    $('body').addClass('market-background');

    var market = new Market(this.product, this.player, this.game, this.competitor, this.debug);
    this.market = market;
    this.market.endGame = this.endGame.bind(this);

    this.view = new MarketView({
      handlers: {
        '.end-turn': function() {
          var movesLeft = _.some(market.humanPlayer.pieces, p => p.moves > 0);
          if (movesLeft) {
            var view = new Confirm(market.endTurn.bind(market));
            view.render('You still have moves remaining, is that ok?', 'End the turn', 'Nevermind');
          } else {
            market.endTurn();
          }
        }
      }
    });

    this.onboardingMessage = ONBOARDING.welcome;

    // re-render the UI whenever a tile is selected or captured
    Tile.onSingleClick.add(this.renderUI, this);
    Tile.onCapture.add(() => {
      if (this.onboardingMessage === ONBOARDING.capture) {
        this.onboardingMessage = ONBOARDING.tiles;
      }
      this.renderUI();
    }, this);
    Tile.onCapture.add(this.captureNotice, this);
    market.board.onCombat = this.combatNotice.bind(this);
    market.board._onDragStart = () => {
      if (this.onboardingMessage === ONBOARDING.product) {
        this.onboardingMessage = ONBOARDING.movement;
      }
      this.renderUI(market.board.selectedTile);
    };
    market.onStartTurn = () => {
      if (market.currentPlayer.human) {
        if (this.onboardingMessage === ONBOARDING.movement) {
          this.onboardingMessage = ONBOARDING.capture;
        } else if (this.onboardingMessage === ONBOARDING.tiles) {
          this.onboardingMessage = ONBOARDING.tiles_more;
        } else if (this.onboardingMessage === ONBOARDING.tiles_more) {
          this.onboardingMessage = ONBOARDING.combat;
        } else if (this.onboardingMessage === ONBOARDING.combat) {
          this.onboardingMessage = ONBOARDING.influencers;
        } else if (this.onboardingMessage === ONBOARDING.influencers) {
          this.onboardingMessage = ONBOARDING.end;
        }
      }
      this.renderUI(market.board.selectedTile);
    };
    market.startTurn(market.humanPlayer);
  }

  notice(tile, msg, offset) {
    var offset = offset || 70,
        coord = this.market.board.coordinateForPosition(tile.position),
        text = this.game.add.text(
          coord.x - offset, coord.y, msg,
          {fill: '#ffffff', stroke: '#000000', strokeThickness: 2, font: 'bold 24pt Work Sans'}),
        tween;
    this.market.board.tileGroup.add(text);
    tween = this.game.add.tween(text).to({
      x: coord.x - offset,
      y: coord.y - 100,
      alpha: 0
    }, 4000, Phaser.Easing.Quadratic.Out, true);
    tween.onComplete.add(function() {
      text.destroy();
    });
    tween.start();
  }

  combatNotice(report) {
    if (report.destroyed.defender) {
      this.notice(report.tiles.defender, 'Wrecked!', 25);
    } else if (report.damageTaken.defender) {
      this.notice(report.tiles.defender, `-${report.damageTaken.defender} health`, 25);
    }

    if (report.destroyed.attacker) {
      this.notice(report.tiles.attacker, 'Wrecked!', 25);
    } else if (report.damageTaken.attacker) {
      this.notice(report.tiles.attacker, `-${report.damageTaken.attacker} health`, 25);
    }
  }

  captureNotice(tile) {
    var msg = tile instanceof Tile.Income ? `+${(((tile.income + 1)/this.market.totalIncome) * 100).toFixed(2)}% market share` : 'Captured influencer!';
    this.notice(tile, msg);
  }

  renderUI(tile) {
    var market = this.market;
    var t = _.clone(tile) || {};
    t.owned = t.owner == market.humanPlayer;
    t.capturing = t.capturedCost > 0;

    t.tileClass = 'neutral';
    if (t.owned) {
      t.tileClass = 'friendly';
    } else if (!_.isUndefined(t.owner)) {
      t.tileClass = 'hostile';
    }
    if (t.piece) {
      t.pieceClass = t.piece.owner == market.humanPlayer ? 'friendly' : 'hostile';
    }
    if (_.isFunction(t.bonus)) {
      t.bonus = t.bonus();
    }

    if (t.pieceClass === 'friendly' && this.onboardingMessage === ONBOARDING.welcome) {
      this.onboardingMessage = ONBOARDING.product;
    }

    this.view.render({
      human: market.currentPlayer.human,
      competitor: market.aiPlayer.company,
      tile: t,
      marketShares: market.percentMarketShare(),
      turnsLeft: market.turnsLeft,
      totalTurns: market.totalTurns,
      turnsPercent: (market.totalTurns - market.turnsLeft)/market.totalTurns * 100
    });

    if (!this.player.seenMarket) {
      $('.market-tutorial').html(this.onboardingMessage);
      $('.market-tutorial').show();
    }
  }

  endGame(reason) {
    var view = new Alert({
      onDismiss: () => {
        var market = this.market;
        var marketShares = _.filter(market.humanPlayer.tiles, t => t instanceof Tile.Income),
            influencers = _.filter(market.humanPlayer.tiles, t => t instanceof Tile.Influencer);
        var results = Product.setRevenue(this.product, marketShares, influencers.length, this.player);
        results.marketShare = market.percentMarketShare().human;
        this.player.company.finishProduct(this.product);

        Tile.onCapture.removeAll();
        Tile.onSingleClick.removeAll();
        Tile.onDoubleClick.removeAll();

        this.view.remove();
        this.player.save();
        $('#market').removeClass('market-active');
        $('body').removeClass('market-background');

        this.game.state.states['Manage'].marketResults = results;
        this.game.state.start('Manage');
      },
      attrs: { class: 'alert market-ending-alert' }
    });
    view.render({message: reason});
    this.player.seenMarket = true;
  }
}

export default TheMarket;
