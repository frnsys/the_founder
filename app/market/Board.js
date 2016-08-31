/*
 * Board
 * - manages tile placement
 * - manages tile interaction
 * - manages tile visualization
 * - manages piece movement
 * - board size is a function of player company locations and markets
 */

import _ from 'underscore';
import Tile from './Tile';
import Position from './Position';


const evenAdjacentPositions = [
  new Position(-1, -1), // upper left
  new Position( 0, -1), // upper right
  new Position(-1,  0), // left
  new Position( 1,  0), // right
  new Position(-1,  1), // bottom left
  new Position( 0,  1), // bottom right
];
const oddAdjacentPositions = [
  new Position( 0, -1), // upper left
  new Position( 1, -1), // upper right
  new Position(-1,  0), // left
  new Position( 1,  0), // right
  new Position( 0,  1), // bottom left
  new Position( 1,  1), // bottom right
];

const humanMoveHighlightColor = 0xF1FA89;
const enemyMoveHighlightColor = 0xFA6B6B;


// hex grid manhattan distance
function manhattanDistance(pos1, pos2) {
  if (_.isEqual(pos1, pos2)) {
    return 0;
  }
  return Math.max(
    Math.abs(pos2.row - pos1.row),
    Math.abs(Math.ceil(pos2.row/-2) + pos2.col - Math.ceil(pos1.row/-2) - pos1.col),
    Math.abs(-pos2.row - Math.ceil(pos2.row/-2) - pos2.col + pos1.row + Math.ceil(pos1.row/-2) + pos1.col)
  );
}


class Board {
  constructor(company, rows, cols, players, game) {
    var self = this;
    var nTiles = 24 + company.locations.length + 3 * company.markets.length;
    this.tileWidth = 104;
    this.tileHeight = 88;
    this.cols = cols;
    this.rows = rows;
    this.game = game;

    this.selectedTile = null;
    this._validMoves = [];
    Tile.onSingleClick.add(this.onSingleClickTile, this);
    Tile.onDoubleClick.add(this.onDoubleClickTile, this);

    // can't have more tiles than spaces in the grid
    nTiles = Math.min(cols * rows, nTiles);

    // initialize the grid
    this.grid = [];
    for (var i=0; i < rows; i++) {
      var row = [];
      for (var j=0; j < cols; j++) {
        row.push(null);
      }
      this.grid.push(row);
    }

    if (this.game.debugger) {
      this.texts = [];
    }

    // generate the board
    this.center = new Position(Math.round(cols/2), Math.round(rows/2));
    this.tileGroup = this.game.add.group();
    var occupiedPositions = [this.center];

    this.placeTileAt(Tile.random(), this.center);
    while (occupiedPositions.length < nTiles) {
      var pos = _.sample(this.openPositions(occupiedPositions));
      this.placeTileAt(Tile.random(), pos);
      occupiedPositions.push(pos);
    }

    // place HQs
    // place first player at random location
    var startingPositions = [
      _.sample(occupiedPositions)
    ];

    // place other players as far as possible from other players
    _.each(_.rest(players), function(player) {
      var bestScore = 0,
          bestPos = self.center;

      // not efficient, but fine for here
      _.each(occupiedPositions, function(pos) {
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
          .map(p => self.adjacentUnoccupiedTilePositions(p.position))
          .flatten().sample().value();
        self.placePieceAt(p, pos);
      });
    });

    // center the map
    var minRow = this.rows,
        maxRow = 0,
        minCol = this.cols,
        maxCol = 0;
    _.each(occupiedPositions, function(pos) {
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
    var maxs = this.coordinateForPosition(new Position(maxCol, maxRow)),
        mins = this.coordinateForPosition(new Position(minCol, minRow)),
        offsetX = this.game.world.centerX - (mins.x + (maxs.x - mins.x)/2),
        offsetY = this.game.world.centerY - (mins.y + (maxs.y - mins.y)/2);

    // shift by this.tileWidth to make space on the left for the UI
    this.tileGroup.x = offsetX + this.tileWidth;
    this.tileGroup.y = offsetY - this.tileHeight/2;

    if (this.texts) {
      _.each(this.texts, function(text) {
        self.tileGroup.add(text);
      });
    }
  }

  adjacentPositions(pos) {
    var shifts = pos.row % 2 == 0 ? evenAdjacentPositions : oddAdjacentPositions,
        adjPos = _.map(shifts, shift => pos.add(shift));

    // filter out invalid positions
    return _.filter(adjPos, adj => this.isValidPosition(adj));
  }

  isValidPosition(pos) {
    return pos.row >= 0 && pos.row < this.rows && pos.col >= 0 && pos.col < this.cols;
  }

  // adjacent positions with an unoccupied tile
  adjacentUnoccupiedTilePositions(pos) {
    return _.filter(this.adjacentTilePositions(pos), adj => !this.grid[adj.row][adj.col].piece);
  }

  // adjacent positions with a tile
  adjacentTilePositions(pos) {
    return _.filter(this.adjacentPositions(pos), adj => this.grid[adj.row][adj.col] !== null);
  }

  // get all open positions (i.e. without a tile)
  // adjacent to the specified positions
  openPositions(positions) {
    var self = this;
    return _.flatten(_.map(positions, function(pos) {
      return _.filter(self.adjacentPositions(pos), adj => self.grid[adj.row][adj.col] == null);
    }));
  }

  placeTileAt(tile, pos) {
    var coord = this.coordinateForPosition(pos);
    tile.render(coord, this.tileGroup, this.game, this.tileHeight);
    this.grid[pos.row][pos.col] = tile;
    tile.position = pos;

    if (this.texts) {
      var text = this.game.add.text(coord.x, coord.y, pos.col.toString() + "," + pos.row.toString());
      this.texts.push(text);
    }
  }

  movePieceTo(piece, to, target, cb) {
    // pass in `target` if we are moving to attack
    var self = this,
        from = piece.position;
    this.grid[from.row][from.col].piece = null;

    // figure out intermediary tiles with A*
    var fringe = [[from]],
        explored = [],
        path, last, successorPaths;
    while (fringe.length > 0) {
      path = fringe.shift();
      last = _.last(path);
      explored.push(last);
      if (_.isEqual(last, to)) {
        break;
      }
      successorPaths = _.compact(_.map(this.adjacentTilePositions(last), function(pos) {
        var tile = self.grid[pos.row][pos.col];
        // only consider unexplored positions
        // or unoccupied positions
        // or friendly positions
        // or those occupied by the target, if one is specified
        if (!_.findWhere(explored, pos) || !tile.piece || tile.piece.owner == piece.owner || tile.piece == target) {
          return _.union(path, [pos]);
        }
      }));
      fringe = _.sortBy(_.union(fringe, successorPaths), function(p) {
        return p.length + manhattanDistance(_.last(p), to);
      });
    }

    // first is the root/from, so skip it
    path = _.rest(path);

    // if a piece is attacking a target,
    // move it just short of the final position
    if (target) {
      path = _.initial(path);
    }

    if (path.length > 0) {
      this.animatePieceAlongPath(piece, path, _.last(path), cb);
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
    var tile = this.grid[pos.row][pos.col],
        coord = this.coordinateForPosition(pos);
    piece.render(coord, this.tileGroup, this.game, this.tileHeight, this.tileWidth);
    piece.position = pos;
    piece.tile = tile;
    tile.piece = piece;
  }

  coordinateForPosition(pos) {
    // hexagon row shift
    var shift = ((pos.row%2) * this.tileWidth/2),
        x = this.game.world.centerX + ((pos.col - this.center.col) * this.tileWidth) + shift,
        y = this.game.world.centerY + ((pos.row - this.center.row) * this.tileHeight);
    return {x: x, y: y};
  }

  onSingleClickTile(tile) {
    var self = this;
    this.unhighlightTiles();
    this._validMoves = [];

    // highlight selected tile
    this.selectedTile = tile;
    this.selectedTile.sprite.tint -= 0x444444;

    // highlight valid movement tiles
    if (tile.piece) {
      tile.sprite.tint = tile.piece.owner.human ? humanMoveHighlightColor : enemyMoveHighlightColor;
      this._validMoves = this.validMoves(tile, tile.piece.moves);
      _.each(this._validMoves, function(pos) {
        var t = self.grid[pos.row][pos.col], color;
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
    var selectedPieceIsValid = this.selectedTile
      && this.selectedTile.piece
      && this.selectedTile.piece.owner.human
      && this.selectedTile.piece.moves > 0;
    var selectedTileIsValid = _.any(this._validMoves, pos => _.isEqual(pos, tile.position));
    if (selectedPieceIsValid && selectedTileIsValid) {
      var attacker = this.selectedTile.piece,
          defender = tile.piece;
      this.selectedTile.piece.moves -= manhattanDistance(this.selectedTile.position, tile.position);
      if (defender && attacker.owner != defender.owner) {
        this.movePieceTo(this.selectedTile.piece, tile.position, defender, function() {
          self.attackPiece(attacker, defender);
        });
      } else {
        this.movePieceTo(this.selectedTile.piece, tile.position);
      }
      this.selectedTile = null;
      this.unhighlightTiles();
    }
    else if (_.isFunction(tile.capture) && tile.piece && tile.piece.product && tile.piece.moves > 0) {
      tile.capture(tile.piece);
    }
  }

  attackPiece(attacker, defender) {
    console.log('~BOARD attack');
    console.log(attacker);
    console.log(defender);
    attacker.attack(defender);
    // move to the defender spot if they were destroyed
    if (defender.health <= 0) {
      this.movePieceTo(attacker, defender.position);
    }
  }

  unhighlightTiles() {
    _.each(this.tiles, t => t.resetColor());
  }

  tilesInRange(tile, range) {
    var fringe = [tile.position],
        tiles = [];

    console.log('TILES IN RANGE');
    console.log(fringe);
    while (range > 0) {
      fringe = _.flatten(_.map(fringe, pos => this.adjacentTilePositions(pos)));
      tiles = _.union(tiles, _.map(fringe, pos => this.grid[pos.row][pos.col]));
      range--;
    }
    return tiles;
  }

  validMoves(tile, moves) {
    var self = this,
        fringe = [tile.position],
        validPositions = [];
    while (moves > 0) {
      fringe = _.flatten(_.map(fringe, function(pos) {
        return _.filter(self.adjacentTilePositions(pos), function(adj) {
          var t = self.grid[adj.row][adj.col];
          if (!t.piece) {
            validPositions.push(adj);
            return true;

          // tiles with enemy pieces are valid, but enemy pieces block,
          // so they cannot be used in the fringe
          } else if (tile.piece && t.piece.owner != tile.piece.owner) {
            validPositions.push(adj);
            return false;

          // occupied by a friendly
          // not a valid move position,
          // but can be used for the fringe
          } else {
            return true;
          }
        });
      }));
      moves--;
    }
    return validPositions;
  }

  get tiles() {
    return _.compact(_.flatten(this.grid));
  }

  get uncapturedTiles() {
    return _.filter(this.tiles, function(tile) {
      return (tile instanceof Tile.Income) && !(tile.owner);
    });
  }

  get incomeTiles() {
    return _.filter(this.tiles, function(tile) {
      return tile instanceof Tile.Income;
    });
  }
}

Board.manhattanDistance = manhattanDistance;
export default Board;
