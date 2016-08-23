import _ from 'underscore';
import Tile from './Tile';
import Position from './Position';

const debug = false; // TODO move this to part of the proper debugger

const evenAdjacentPositions = [
  new Position(-1, -1), // upper left
  new Position(0, -1), // upper right
  new Position(-1, 0), // left
  new Position(1, 0),  // right
  new Position(-1, 1), // bottom left
  new Position(0, 1),  // bottom right
];
const oddAdjacentPositions = [
  new Position(0, -1), // upper left
  new Position(1, -1), // upper right
  new Position(-1, 0), // left
  new Position(1, 0),  // right
  new Position(0, 1), // bottom left
  new Position(1, 1),  // bottom right
];

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
  constructor(nTiles, rows, cols, players, game) {
    var self = this;
    this.tileWidth = 104;
    this.tileHeight = 88;
    this.cols = cols;
    this.rows = rows;
    this.game = game;
    this.prob = {
      influencer: 0.01,
      empty: 0.3
    };

    this.selectedTile = null;
    this.highlightedTiles = [];
    this.validMoves = [];
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

    if (debug) {
      this.texts = [];
    }

    // generate the board
    this.center = new Position(Math.round(cols/2), Math.round(rows/2));
    this.tileGroup = this.game.add.group();
    var occupiedPositions = [this.center];

    this.placeTileAt(this.randomTile(), this.center);
    while (occupiedPositions.length < nTiles) {
      var pos = _.sample(this.openPositions(occupiedPositions));
      this.placeTileAt(this.randomTile(), pos);
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
        // get a random piece that has been placed
        var piece = _.sample(_.filter(player.pieces, pe => pe.position));
            pos = _.sample(self.adjacentUnoccupiedTilePositions(piece.position));
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

    if (debug) {
      _.each(this.texts, function(text) {
        self.tileGroup.add(text);
      });
    }
  }

  get tiles() {
    return _.compact(_.flatten(this.grid));
  }

  adjacentPositions(pos) {
    var self = this,
        adjPositions = pos.row % 2 == 0 ? evenAdjacentPositions : oddAdjacentPositions,
        adjPos = _.map(adjPositions, function(adj) {
          return pos.add(adj);
        });

    // filter out invalid positions
    return _.filter(adjPos, function(adj) {
      return (adj.row >= 0 && adj.row < self.rows && adj.col >= 0 && adj.col < self.cols);
    });
  }

  adjacentUnoccupiedTilePositions(pos) {
    var self = this;
    return _.filter(self.adjacentTilePositions(pos), function(adj) {
      return !self.grid[adj.row][adj.col].piece;
    });
  }

  adjacentTilePositions(pos) {
    var self = this;
    return _.filter(self.adjacentPositions(pos), function(adj) {
      return self.grid[adj.row][adj.col] !== null;
    });
  }

  // get all open positions (i.e. without a tile)
  // adjacent to the specified positions
  openPositions(positions) {
    var self = this;
    return _.flatten(_.map(positions, function(pos) {
      return _.filter(self.adjacentPositions(pos), function(adj) {
        return self.grid[adj.row][adj.col] == null;
      });
    }));
  }

  placeTileAt(tile, pos) {
    var coord = this.coordinateForPosition(pos);
    tile.sprite = this.tileGroup.create(coord.x, coord.y, tile.spriteName);
    if (tile.owner !== undefined) {
      tile.sprite.tint = tile.owner.color;
    }
    tile.sprite.inputEnabled = true;
    tile.sprite.events.onInputDown.add(tile.onClick, tile);
    tile.sprite.events.onInputOver.add(function() {
      this.game.canvas.style.cursor = "pointer";
    }, this);
    tile.sprite.events.onInputOut.add(function() {
      this.game.canvas.style.cursor = "default";
    }, this);
    this.grid[pos.row][pos.col] = tile;
    this.grid[pos.row][pos.col] = tile;
    tile.position = pos;

    if (tile.baseCost) {
      // TODO color text according to capturer
      tile.text = this.game.add.text(12, this.tileHeight - 24, (tile.baseCost - tile.capturedCost).toString(), {fill: '#ffffff', stroke: '#000000', strokeThickness: 6});
      tile.sprite.addChild(tile.text);
      if (!tile.capturedCost) {
        tile.text.text = '';
      }
    }

    if (debug) {
      var text = this.game.add.text(coord.x, coord.y, pos.col.toString() + "," + pos.row.toString());
      this.texts.push(text);
    }
  }

  movePieceTo(piece, to) {
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
        // skip explored or occupied positions
        if (tile.piece || _.findWhere(explored, pos)) {
          return null;
        }
        return _.union(path, [pos]);
      }));
      fringe = _.sortBy(_.union(fringe, successorPaths), function(p) {
        return p.length + manhattanDistance(_.last(p), to);
      });
    }

    // first is the root/from, so skip it
    path = _.rest(path);
    this.animatePieceAlongPath(piece, path);
  }

  animatePieceAlongPath(piece, path, target) {
    var self = this,
        target = target || _.last(path),
        pos = path.shift(),
        coord = this.coordinateForPosition(pos);

    // animate piece to tile
    var tween = this.game.add.tween(piece.sprite).to(coord, 200, Phaser.Easing.Quadratic.InOut, true);
    tween.onComplete.add(function() {
      if (path.length > 0) {
        self.animatePieceAlongPath(piece, path, target);
      } else {
        piece.sprite.destroy();
        self.placePieceAt(piece, target);
      }
    }, this);
  }

  placePieceAt(piece, pos) {
    var tile = this.grid[pos.row][pos.col];
    var coord = this.coordinateForPosition(pos);
    piece.sprite = this.tileGroup.create(coord.x, coord.y, piece.spriteName);
    if (piece.moves === 0) {
      piece.exhaust();
    } else {
      piece.sprite.tint = piece.owner.color;
    }
    piece.text = this.game.add.text(this.tileWidth - 24, this.tileHeight - 24, piece.health.toString(), {fill: '#ffffff', stroke: '#000000', strokeThickness: 6});
    piece.sprite.addChild(piece.text);
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

  randomTile() {
    var roll = Math.random(),
        tile;
    if (roll <= this.prob.empty) {
      tile = new Tile.Empty();
    } else if (roll <= this.prob.empty + this.prob.influencer) {
      tile = new Tile.Influencer();
    } else {
      tile = new Tile.Income();
    }
    return tile;
  }

  onSingleClickTile(tile) {
    var self = this;
    this.unhighlightTiles();
    this.validMoves = [];

    // highlight selected tile
    if (this.selectedTile) {
      this.selectedTile.sprite.tint += 0x222222;
    }
    this.selectedTile = tile;
    this.selectedTile.sprite.tint -= 0x222222;

    if (tile.piece) {
      var moveHighlightColor = 0xF300FF;
      this.highlightTile(tile, moveHighlightColor);
      this.validMoves = this.getValidMoves(tile, tile.piece.moves);
      _.each(this.validMoves, function(pos) {
        var t = self.grid[pos.row][pos.col],
            color = (!t.piece || t.piece.owner.human) ? moveHighlightColor : 0xff0000;
        self.highlightTile(t, color);
      });
    }
  }

  onDoubleClickTile(tile) {
    // if a human piece is selected and it's a valid movement position, move there
    // bleeghghghgh
    if (this.selectedTile && this.selectedTile.piece && this.selectedTile.piece.owner.human && this.selectedTile.piece.moves > 0
        && _.any(this.validMoves, function(pos) { return _.isEqual(pos, tile.position); })) {
          var attacker = this.selectedTile.piece,
              defender = tile.piece;
          if (defender && attacker.owner != defender.owner) {
            this.attackPiece(attacker, defender);
          } else {
            this.selectedTile.piece.moves -= manhattanDistance(this.selectedTile.position, tile.position);
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
    attacker.attack(defender);
    if (defender.health <= 0) {
      defender.destroy();
      defender.text.text = defender.health.toString();
    }
    if (attacker.health <= 0) {
      attacker.destroy();
    } else {
      attacker.text.text = attacker.health.toString();
      // move to the defender spot if they were destroyed
      if (defender.health <= 0) {
        this.movePieceTo(attacker, defender.position);
      }
    }
  }

  highlightTile(tile, color) {
    tile.sprite.tint = color;
    this.highlightedTiles.push(tile);
  }

  unhighlightTiles() {
    _.each(this.highlightedTiles, function(tile) {
      if (tile.owner) {
        tile.sprite.tint = tile.owner.color;
      } else {
        tile.sprite.tint = 0xffffff;
      }
    });
    this.highlightedTiles = [];
  }

  tilesInRange(tile, range) {
    if (range === 0) {
      return [];
    }

    var self = this,
        fringe = [tile.position],
        tiles = [];

    while (range > 0) {
      fringe = _.flatten(_.map(fringe, function(pos) {
        return self.adjacentTilePositions(pos);
      }));
      tiles = _.union(tiles, _.map(fringe, function(pos) {
        return self.grid[pos.row][pos.col];
      }));
      range--;
    }
    return tiles;
  }

  getValidMoves(tile, moves) {
    if (moves === 0) {
      return [];
    }

    var self = this,
        fringe = [tile.position],
        validPositions = [];
    while (moves > 0) {
      fringe = _.flatten(_.map(fringe, function(pos) {
        return _.filter(self.adjacentTilePositions(pos), function(adj) {
          var t = self.grid[adj.row][adj.col];
          if (!t.piece) {
            return true;

          // tiles with enemy pieces are valid, but enemy pieces block,
          // so they cannot be used in the fringe
          } else if (!t.piece.owner.human) {
            validPositions.push(adj);
            return false;

          // occupied by a friendly
          } else {
            return false;
          }
        });
      }));
      validPositions = _.union(validPositions, fringe);
      moves--;
    }
    return validPositions;
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
