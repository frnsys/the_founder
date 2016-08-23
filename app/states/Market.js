import 'pixi';
import 'p2';
import * as Phaser from 'phaser';
import $ from 'jquery';
import _ from 'underscore';
import AI from 'market/AI';
import Tile from 'market/Tile';
import Board from 'market/Board';
import Player from 'market/Player';
import Confirm from 'views/Confirm';
import MarketView from 'views/Market';
import Product from 'game/Product';
import Piece from 'market/Piece';

const MAX_TURNS = 32,
      PIECE_PROB = 0.2;

function createPieces(player, product) {
  var n_pieces = 1 + _.reduce(_.times(product.quantity, i => Math.random() < PIECE_PROB ? 1 : 0), (m,n) => m+n, 0);

  return _.times(n_pieces, function() {
    var strength = Math.max(1, _.random(Math.round(product.strength * 0.4), product.strength)),
        health = Math.max(1, _.random(Math.round(product.health * 0.4), product.health)),
        movement = Math.max(1, _.random(Math.round(product.movement * 0.4), product.movement));
    return new Piece.Product(player, product, strength, health, movement);
  });
}

class TheMarket extends Phaser.State {
  constructor(game, player) {
    super();
    this.game = game;
    this.player = player;
  }

  init(product) {
    this.product = product;
  }

  preload() {
    var self = this;
    this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    this.game.scale.setUserScale(0.5, 0.5);

    _.each(['emptyTile', 'influencerTile', 'income0Tile', 'income1Tile', 'income2Tile', 'income3Tile'], function(sprite) {
        self.game.load.image(sprite, 'assets/tiles/'+sprite+'.png');
     });

    this.game.load.image('productPiece', 'assets/products/cube.png');
  }

  create() {
    $('#market').addClass('market-active');
    $('body').css('background-image', 'url(assets/themarket/01.jpg)');

    var self = this;
    this.totalTurns = MAX_TURNS;
    this.turnsLeft = this.totalTurns;

    var competitor = _.sample(this.player.competitors);
    console.log('competitor is: ' + competitor.name);
    var competitorProduct = Product.createCompetitorProduct(this.product, competitor);
    this.players = [
      new Player(this.player.company, true, 0x8888ff),
      new Player(competitor, false, 0xff6666)
    ];
    this.humanPlayer = this.players[0];
    this.aiPlayer = this.players[1];

    createPieces(this.humanPlayer, this.product);
    createPieces(this.aiPlayer, competitorProduct);

    var nTiles = 24 + this.player.company.locations.length + 3 * this.player.company.markets.length;
    this.board = new Board(nTiles, 13, 14, this.players, this.game);
    this.AI = new AI(this.board, this.aiPlayer);

    this.view = new MarketView({
      handlers: {
        '.end-turn': function() {
          var movesLeft = _.some(self.humanPlayer.pieces, function(piece) {
            return piece.moves > 0;
          });

          if (movesLeft) {
            var view = new Confirm(self.endTurn.bind(self));
            view.render('You still have moves remaining, is that ok?');
          } else {
            self.endTurn();
          }
        }
      }
    });
    this.renderUI();

    // re-render the UI whenever a tile is selected
    Tile.onSingleClick.add(this.renderUI, this);
  }

  update() {
    this.player.onboarder.resolve();
  }

  renderUI(tile) {
    var t = _.clone(tile) || {};
    t.owned = t.owner == this.humanPlayer;
    t.capturing = t.capturedCost > 0;

    t.tileClass = 'neutral';
    if (t.owned) {
      t.tileClass = 'friendly';
    } else if (!_.isUndefined(t.owner)) {
      t.tileClass = 'hostile';
    }
    if (t.piece) {
      t.pieceClass = t.piece.owner == this.humanPlayer ? 'friendly' : 'hostile';
    }
    if (_.isFunction(t.bonus)) {
      t.bonus = t.bonus();
    }

    this.view.render({
      competitor: this.aiPlayer.company,
      tile: t,
      turnsLeft: this.turnsLeft,
      totalTurns: this.totalTurns,
      turnsPercent: (this.totalTurns - this.turnsLeft)/this.totalTurns * 100
    });
  }

  endTurn() {
    this.turnsLeft--;
    if (this.turnsLeft <= 0 || !this.board.uncapturedTiles || (!this.aiPlayer.pieces || !this.humanPlayer.pieces)) {
      this.endGame();
    } else {
      this.startTurn(this.aiPlayer);
      this.AI.takeTurn();
      this.startTurn(this.humanPlayer);
    }
  }

  endGame() {
    var marketShares = this.humanPlayer.tiles;
    Product.setRevenue(this.product, marketShares, this.player);
    this.view.remove();
    this.player.save();
    $('body').css('background-image', 'none');
    $('#market').removeClass('market-active');
    this.game.state.start('Manage');
  }

  startTurn(player) {
    var self = this;
    // reset moves
    _.each(player.pieces, function(piece) {
      piece.moves = piece.movement;
      piece.sprite.tint = piece.owner.color;
    });
    this.renderUI(this.board.selectedTile);
  }
}

export default TheMarket;
