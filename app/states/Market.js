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
import util from 'util';
import AI from 'market/ai/AI';
import Tile from 'market/Tile';
import Board from 'market/Board';
import Piece from 'market/Piece';
import Player from 'market/Player';
import Product from 'game/Product';
import Competitor from 'game/Competitor';
import MarketView from 'views/Market';
import Confirm from 'views/alerts/Confirm';
import MarketReport from 'views/alerts/MarketReport';

const MAX_TURNS = 32,
      PIECE_PROB = 0.2;

function createPieces(player, product) {
  var nPieces = Product.samplePoint('quantity', product);

  return _.times(nPieces, function() {
    var strength = Product.samplePoint('strength', product),
        movement = Product.samplePoint('movement', product);
    return new Piece.Product(player, product, strength, movement);
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

    this.game.load.image('productPiece', 'assets/themarket/product.png');
  }

  create() {
    $('#market').show().addClass('market-active');

    var self = this;
    this.totalTurns = MAX_TURNS;
    this.turnsLeft = this.totalTurns;

    var competitor = _.sample(this.player.competitors);
    console.log('competitor is: ' + competitor.name);
    var competitorProduct = Competitor.createProduct(this.product, competitor);
    this.players = [
      new Player(this.player.company, true, 0x1C1FE8),
      new Player(competitor, false, 0xF7202F)
    ];
    this.humanPlayer = this.players[0];
    this.aiPlayer = this.players[1];

    createPieces(this.humanPlayer, this.product);
    createPieces(this.aiPlayer, competitorProduct);

    this.board = new Board(this.player.company, this.players, this.game);
    this.AI = new AI(this.board, this.aiPlayer);

    // setup income tile descriptions
    _.each(this.board.incomeTiles, function(t) {
      t.description = `Capture cost: ${t.baseCost}<br>Generates ${util.formatCurrency(Product.marketShareToRevenue(t.income, self.product))} revenue`;
    });

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

    // re-render the UI whenever a tile is selected or captured
    Tile.onSingleClick.add(this.renderUI, this);
    Tile.onCapture.add(this.renderUI, this);
    this.startTurn(this.humanPlayer);
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
      human: this.currentPlayer.human,
      competitor: this.aiPlayer.company,
      tile: t,
      marketShares: this.percentMarketShare(),
      turnsLeft: this.turnsLeft,
      totalTurns: this.totalTurns,
      turnsPercent: (this.totalTurns - this.turnsLeft)/this.totalTurns * 100
    });
  }

  percentMarketShare() {
    var shares = {human: 0, ai: 0},
        total = 0,
        self = this;
    _.each(this.board.incomeTiles, function(tile) {
      var income = tile.income + 1;
      total += income;
      if (tile.owner == self.humanPlayer) {
        shares.human += income;
      } else if (tile.owner == self.aiPlayer) {
        shares.ai += income;
      }
    });
    shares.human = (shares.human/total) * 100;
    shares.ai = (shares.ai/total) * 100;
    return shares;
  }

  endTurn() {
    this.turnsLeft--;
    this.board.unhighlightTiles();
    if (this.turnsLeft <= 0 || this.board.uncapturedTiles.length == 0 || (this.aiPlayer.pieces.length == 0 || this.humanPlayer.pieces.length == 0)) {
      this.endGame();
    } else {
      var self = this;
      // this.startTurn(this.aiPlayer);
      // this.AI.takeTurn(() => this.startTurn(this.humanPlayer));
      this.startTurn(this.humanPlayer); //TEMP TODO
    }
  }

  endGame() {
    var marketShares = _.filter(this.humanPlayer.tiles, t => t instanceof Tile.Income),
        influencers = _.filter(this.humanPlayer.tiles, t => t instanceof Tile.Influencer);
    var results = Product.setRevenue(this.product, marketShares, influencers, this.player);
    results.marketShare = this.percentMarketShare().human;

    this.view.remove();
    this.player.save();
    $('#market').removeClass('market-active');

    this.game.state.start('Manage');
    var report = new MarketReport();
    report.render(results);
  }

  startTurn(player) {
    // reset moves
    _.each(player.pieces, p => p.reset());
    this.currentPlayer = player;
    this.renderUI(this.board.selectedTile);
  }
}

export default TheMarket;
