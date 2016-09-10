/*
 * Board
 * - the interactive/visualized layer on top of the grid
 * - manages tile placement
 * - manages tile interaction
 * - manages tile visualization
 * - manages piece movement
 * - board size is a function of player company locations and markets
 */

import _ from 'underscore';
import Grid from './Grid';
import Tile from './Tile';
import Position from './Position';

const rows = 12;
const cols = 14;
const tileWidth = 104;
const tileHeight = 88;
const humanMoveHighlightColor = 0xF1FA89;
const enemyMoveHighlightColor = 0xFA6B6B;

class Board {
  constructor(company, players, game) {
    var self = this;
    var nTiles = 24 + company.locations.length + 3 * company.markets.length;
    this.cols = cols;
    this.rows = rows;
    this.game = game;

    this.selectedTile = null;
    this.validMoves = [];
    Tile.onSingleClick.add(this.onSingleClickTile, this);
    Tile.onDoubleClick.add(this.onDoubleClickTile, this);

    // can't have more tiles than spaces in the grid
    nTiles = Math.min(cols * rows, nTiles);

    this.grid = new Grid(rows, cols);
    this.setupTiles(nTiles, rows, cols);
    this.setupPlayers(players);
    this.centerMap();

    this.humanPlayer = _.find(players, p => p.human);
  }

  setupTiles(nTiles, rows, cols) {
    // generate the board
    this.center = new Position(Math.round(rows/2), Math.round(cols/2));
    this.tileGroup = this.game.add.group();
    var tilePositions = [this.center];
    this.placeTileAt(Tile.random(), this.center);

    while (tilePositions.length < nTiles) {
      var pos = _.chain(tilePositions)
        .map(p => this.grid.adjacentNoTilePositions(p))
        .flatten().sample().value();
      this.placeTileAt(Tile.random(), pos);
      tilePositions.push(pos);
    }
  }

  setupPlayers(players) {
    // place HQs
    // place first player at random location
    var self = this;
    var startingPositions = [
      _.sample(this.grid.tilePositions)
    ];

    // place other players as far as possible from other players
    _.each(_.rest(players), function(player) {
      var bestScore = 0,
          bestPos = self.center;

      // not efficient, but fine for here
      _.each(self.grid.tilePositions, function(pos) {
        var score = _.reduce(startingPositions, function(mem, spos) {
          // manhattan distance
          return Math.abs(pos.col - spos.col) + Math.abs(pos.row - spos.row);
        }, 0);
        if (score > bestScore) {
          bestScore = score;
          bestPos = pos;
        }
      });
      startingPositions.push(bestPos);
    });

    // place pieces at starting positions
    for (var i=0; i < startingPositions.length; i++) {
      this.placePieceAt(players[i].pieces[0], startingPositions[i]);
    }

    // randomly distribute remaining player pieces
    // nearby their starting positions
    _.each(players, function(player) {
      _.each(_.rest(player.pieces), function(p) {
        // get a random unoccupied position adjacent to an already-placed piece
        var pos = _.chain(player.pieces)
          .filter(p => p.position)
          .map(p => self.grid.adjacentUnoccupiedTilePositions(p.position))
          .flatten().sample().value();
        self.placePieceAt(p, pos);
      });
    });
  }

  centerMap() {
    // center the map
    var minRow = this.rows,
        maxRow = 0,
        minCol = this.cols,
        maxCol = 0;
    _.each(this.grid.tilePositions, function(pos) {
      if (pos.row > maxRow) {
        maxRow = pos.row;
      } else if (pos.row < minRow) {
        minRow = pos.row;
      }
      if (pos.col > maxCol) {
        maxCol = pos.col;
      } else if (pos.col < minCol) {
        minCol = pos.col;
      }
    });
    var maxs = this.coordinateForPosition(new Position(maxRow, maxCol)),
        mins = this.coordinateForPosition(new Position(minRow, minCol)),
        offsetX = this.game.world.centerX - (mins.x + (maxs.x - mins.x)/2),
        offsetY = this.game.world.centerY - (mins.y + (maxs.y - mins.y)/2);

    // shift by tileWidth to make space on the left for the UI
    this.tileGroup.x = offsetX + tileWidth;
    this.tileGroup.y = offsetY - tileHeight/2;
  }

  placeTileAt(tile, pos) {
    var coord = this.coordinateForPosition(pos);
    tile.render(coord, this.tileGroup, this.game, tileHeight);
    this.grid.setTileAt(pos, tile);
    tile.position = pos;
  }

  debug() {
    var self = this;
    _.each(this.tiles, function(t) {
      var pos = t.position,
          coord = self.coordinateForPosition(pos),
          text = self.game.add.text(coord.x, coord.y, pos.col.toString() + "," + pos.row.toString());
      self.tileGroup.add(text);
    });
  }

  checkHumanDone() {
    var noMoves = _.every(this.humanPlayer.pieces, p => p.moves === 0);
    var noPieces = this.humanPlayer.pieces.length === 0;
    if (_.isFunction(this.onHumanDone) && (noMoves || noPieces)) {
      this.onHumanDone();
    }
  }

  movePieceTowards(piece, toTile, cb) {
    var self = this,
        from = piece.position,
        cb = cb || _.noop;

    var predicate = function(tile) {
      var unoccupied = !tile.piece,
          friendly = tile.piece && tile.piece.owner == piece.owner;
      return unoccupied || friendly;
    }
    var path = this.grid.findLegalPath(piece, toTile, predicate.bind(this));

    if (path && path.length > 0) {
      piece.moves -= path.length;
      this.grid.tileAt(from).piece = null;
      this.animatePieceAlongPath(piece, path, _.last(path), cb);
    } else {
      cb();
    }
  }

  animatePieceAlongPath(piece, path, target, cb) {
    var self = this,
        cb = cb || _.noop,
        pos = path.shift(),
        coord = this.coordinateForPosition(pos);

    // animate piece to tile
    var tween = this.game.add.tween(piece.sprite).to(coord, 200, Phaser.Easing.Quadratic.InOut, true);
    tween.onComplete.add(function() {
      if (path.length > 0) {
        self.animatePieceAlongPath(piece, path, target, cb);
      } else {
        self.placePieceAt(piece, target);
        cb();
      }
    }, this);
  }

  placePieceAt(piece, pos) {
    var tile = this.grid.tileAt(pos),
        coord = this.coordinateForPosition(pos);
    piece.render(coord, this.tileGroup, this.game, tileHeight, tileWidth);
    piece.position = pos;
    piece.tile = tile;
    tile.piece = piece;
  }

  coordinateForPosition(pos) {
    // hexagon row shift
    var shift = ((pos.row%2) * tileWidth/2),
        x = this.game.world.centerX + ((pos.col - this.center.col) * tileWidth) + shift,
        y = this.game.world.centerY + ((pos.row - this.center.row) * tileHeight);
    return {x: x, y: y};
  }

  onSingleClickTile(tile) {
    var self = this;
    this.unhighlightTiles();
    this.validMoves = [];

    // highlight selected tile
    this.selectedTile = tile;
    this.selectedTile.sprite.tint = humanMoveHighlightColor;

    // highlight valid movement tiles
    if (tile.piece) {
      tile.sprite.tint = tile.piece.owner.human ? humanMoveHighlightColor : enemyMoveHighlightColor;
      this.validMoves = this.grid.validMovePositions(tile, tile.piece.moves);
      _.each(this.validMoves, function(pos) {
        var t = self.grid.tileAt(pos), color;
        if(tile.piece.owner.human) {
          color = (!t.piece || t.piece.owner.human) ? humanMoveHighlightColor : enemyMoveHighlightColor;
        } else {
          color = enemyMoveHighlightColor;
        }
        t.sprite.tint = color;
      });
    }
  }



  onDoubleClickTile(tile) {
    var self = this;
    if (!this.selectedTile) {
      this.selectedTile = tile;
    }
    var selectedPieceIsValid = this.selectedTile
      && this.selectedTile.piece
      && this.selectedTile.piece.owner.human
      && this.selectedTile.piece.moves > 0;
    if (selectedPieceIsValid) {
      var selectedTileIsValid = _.any(this.validMoves, pos => _.isEqual(pos, tile.position));
      if (selectedTileIsValid && this.selectedTile != tile) {
        var attacker = this.selectedTile.piece,
            defender = tile.piece;
        if (defender && attacker.owner != defender.owner) {
          this.movePieceTowards(this.selectedTile.piece, tile, function() {
            // check we're actually close enough to attack
            if (attacker.moves > 0 && _.contains(self.grid.tilesInRange(attacker.tile.position, 1), tile)) {
              self.attackPiece(attacker, defender);
              self.checkHumanDone();
            }
          });
        } else {
          this.movePieceTowards(this.selectedTile.piece, tile, this.checkHumanDone.bind(this));
        }
      } else if (_.isFunction(tile.capture) && tile.piece == this.selectedTile.piece && tile.piece.product && tile.piece.moves > 0) {
        tile.capture(tile.piece);
        this.checkHumanDone();
      }
    }
    this.selectedTile = null;
    this.unhighlightTiles();
  }

  attackPiece(attacker, defender) {
    attacker.attack(defender);
    // move to the defender spot if they were destroyed
    if (defender.health <= 0 && attacker.health > 0) {
      this.animatePieceAlongPath(attacker, [defender.position], defender.position);
    }
  }

  unhighlightTiles() {
    _.each(this.grid.tiles, t => t.resetColor());
  }

  get incomeTiles() {
    return _.filter(this.grid.tiles, t => t instanceof Tile.Income);
  }

  get influencerTiles() {
    return _.filter(this.grid.tiles, t => t instanceof Tile.Influencer);
  }

  get uncapturedTiles() {
    return _.filter(this.grid.tiles, t => (t instanceof Tile.Income) && !(t.owner));
  }
}
export default Board;
