/*
 * Grid
 * - manages the hex grid
 * - provides a higher-level API for accessing the hex grid
 */

import _ from 'underscore';
import Position from './Position';

const evenAdjacentPositions = [
  new Position(-1, -1), // upper left
  new Position(-1,  0), // upper right
  new Position( 0, -1), // left
  new Position( 0,  1), // right
  new Position( 1, -1), // bottom left
  new Position( 1,  0)  // bottom right
];
const oddAdjacentPositions = [
  new Position(-1,  0), // upper left
  new Position(-1,  1), // upper right
  new Position( 0, -1), // left
  new Position( 0,  1), // right
  new Position( 1,  0), // bottom left
  new Position( 1,  1)  // bottom right
];

class Grid {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols
    this.grid = [];
    for (var i=0; i < rows; i++) {
      var row = [];
      for (var j=0; j < cols; j++) {
        row.push(null);
      }
      this.grid.push(row);
    }
  }

  get tiles() {
    return _.compact(_.flatten(this.grid));
  }

  get tilePositions() {
    return _.pluck(this.tiles, 'position');
  }

  tileAt(pos) {
    return this.grid[pos.row][pos.col];
  }

  setTileAt(pos, tile) {
    this.grid[pos.row][pos.col] = tile;
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

  adjacentUnoccupiedTilePositions(pos) {
    return _.filter(this.adjacentTilePositions(pos), adj => !this.tileAt(adj).piece);
  }

  adjacentTilePositions(pos) {
    return _.filter(this.adjacentPositions(pos), adj => this.tileAt(adj) !== null);
  }

  // get all open positions (i.e. without a tile)
  // adjacent to the specified positions
  adjacentNoTilePositions(pos) {
    return _.filter(this.adjacentPositions(pos), adj => this.tileAt(adj) == null);
  }

  tilesInRange(pos, range) {
    var fringe = [pos],
        tiles = [];

    while (range > 0) {
      fringe = _.chain(fringe)
        .map(p => this.adjacentTilePositions(p))
        .flatten().filter(p => !_.isEqual(p, pos)).value();
      tiles = _.union(tiles, _.map(fringe, p => this.tileAt(p)));
      range--;
    }
    return tiles;
  }

  findLegalPath(piece, toTile, validPredicate) {
    var from = piece.position,
        to = toTile.position,
        dist = Grid.manhattanDistance(from, to),
        withinReach = dist <= piece.moves,
        unoccupied = !toTile.piece;

    if (_.isEqual(from, to)) {
      return [];
    } else if (withinReach && unoccupied) {
      return this.findPath(from, to, validPredicate);
    } else {
      // find all tiles that are within reach
      // and between the from (start) and to (end) positions
      // then sort then by closest distance to the to position
      var tilesWithinReach = _.chain(this.tiles)
        .map(function(t) {
          var pos = t.position,
              startToTile = Grid.manhattanDistance(from, pos),
              tileToEnd = Grid.manhattanDistance(to, pos),
              betweenStartAndEnd = startToTile < dist && tileToEnd < dist,
              withinReach = startToTile < piece.moves;

          if (betweenStartAndEnd && withinReach) {
            return {
              startToTile: startToTile,
              tileToEnd: tileToEnd,
              length: (startToTile + tileToEnd) * tileToEnd,
              tile: t,
              position: t.position
            }
          } else {
            return null;
          }
        }).compact().sortBy('length').value();

      // find the tile closest to the to position
      // that is also unoccupied and return a path to it
      while (tilesWithinReach.length > 0) {
        var candidate = tilesWithinReach.shift();
        if (!candidate.tile.piece) {
          return this.findPath(from, candidate.tile.position, validPredicate);
        }
      }
    }
  }

  findPath(from, to, validPredicate) {
    var self = this,
        fringe = [[from]],
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
        var tile = self.tileAt(pos);
        // only consider positions that are unexplored
        // and satisfy the specified valid predicate
        if (!_.findWhere(explored, pos) && validPredicate(tile)) {
          return _.union(path, [pos]);
        }
      }));
      fringe = _.sortBy(_.union(fringe, successorPaths), function(p) {
        return p.length + Grid.manhattanDistance(_.last(p), to);
      });
    }
    // first is the root/from, so skip it
    return _.rest(path);
  }

  validMovePositions(tile, range) {
    var self = this,
        fringe = [tile.position],
        explored = [],
        validPositions = [];
    while (range > 0) {
      fringe = _.flatten(_.map(fringe, function(pos) {
        return _.filter(self.adjacentTilePositions(pos), function(adj) {
          var t = self.tileAt(adj);
          if (_.findWhere(explored, adj)) {
            // skip explored
            return false;
          }

          explored.push(adj)
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
      range--;
    }
    return validPositions;
  }
}

// hex grid manhattan distance
Grid.manhattanDistance = function(pos1, pos2) {
  if (_.isEqual(pos1, pos2)) {
    return 0;
  }
  return Math.max(
    Math.abs(pos2.row - pos1.row),
    Math.abs(Math.ceil(pos2.row/-2) + pos2.col - Math.ceil(pos1.row/-2) - pos1.col),
    Math.abs(-pos2.row - Math.ceil(pos2.row/-2) - pos2.col + pos1.row + Math.ceil(pos1.row/-2) + pos1.col)
  );
};

export default Grid;
