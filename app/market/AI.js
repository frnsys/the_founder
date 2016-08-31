/*
 * AI
 * - fairly simple competitor AI
 * - composed of two components: strategic (high-level tasks) and tactical (low-level actions)
 * - ultimate goal of the game is to capture as many valuable (income) tiles as possible
 * - priority of tasks:
 *   - defend threatened tiles
 *   - capture tiles
 */

import _ from 'underscore';
import Tile from './Tile';
import Piece from './Piece';
import Board from './Board';
import Product from 'game/Product';


class AI {
  constructor(board, player) {
    this.board = board;
    this.player = player;
    this.log = function(msg) {
      console.log("AI:" + msg);
    }
  }

  planTasks() {
    this.log('planning tasks...');
    var self = this,
        board = this.board,
        taskQueue = [],
        assignedTasks = [],
        unassignedTasks = [];

    // consider all possible tasks
    if (this.player.pieces.length > 0) {
      _.each(board.tiles, function(tile) {
        var val = tileValue(tile),
            tasks = []
        if (tile.owner == self.player) {
          var threatValue = tileThreats(board, tile);
          if (threatValue > 0) {
            tasks.push(new Task.Defend(tile) * threatValue);
          }
        } else if (tile.owner) {
          tasks.push(new Task.Capture(tile));
        } else {
          tasks.push(new Task.Capture(tile));
        }

        // consider all assignments to each task
        tasks = _.flatten(_.map(tasks, function(task) {
          return _.compact(_.map(self.player.pieces, function(piece) {
            // only consider valid assignments
            if (!task.validPiece || piece instanceof task.validPiece) {
              return Task.assign(task, piece);
            }
            return null;
          }));
        }));

        taskQueue = _.union(taskQueue, tasks);
      });

      // sort tasks by value
      taskQueue = _.sortBy(taskQueue, 'value').reverse();

      var unassignedPieces = this.player.pieces;
      while (unassignedPieces.length > 0) {
        var task = taskQueue.shift();
        // if the piece has been assigned
        if (!_.contains(unassignedPieces, task.piece)) {
          unassignedTasks.push(task);
        } else {
          unassignedPieces = _.without(unassignedPieces, task.piece);
          assignedTasks.push(task);
        }
      }
      unassignedTasks = _.union(unassignedTasks, taskQueue);
    }

    return assignedTasks;
  }

  takeTurn() {
    var self = this,
        tasks = this.planTasks();
    console.log(tasks);
    _.each(tasks, function(task) {
      task.execute(self, self.board);
    });
  }
}

var tileValue = function(tile) {
  if (tile instanceof Tile.Income) {
    return 3 * tile.income;
  } else if (tile instanceof Tile.Influencer) {
    return 4;
  } else {
    return 0;
  }
};

// value of a piece given a tile
var pieceValue = function(piece, tile) {
  // the stronger & closer, the more valuable
  var distanceValue = 1/(Board.manhattanDistance(piece.position, tile.position) + 1e-12),
      healthValue = piece.health;
  return distanceValue * healthValue;
};

var movePieceTowards = function(board, piece, tile, range) {
  console.log('MOVING towards tile:');
  console.log(tile);
  var bestPosition;
  if (piece.tile == tile || piece.moves === 0) {
    return;
  }

  var validPositions = board.validMoves(piece.tile, piece.moves);
  if (validPositions.length === 0) {
    return;
  }

  // if range specified,
  // move piece until they are within `range` spaces to the tile
  if (range) {
    var nearbyPositions = _.pluck(board.tilesInRange(tile, range), 'position'),
        overlapPositions = _.intersection(nearbyPositions, validPositions);

    // return if already within range
    if (_.contains(nearbyPositions, piece.position)) {
      return;
    }

    // find the overlap position closest to the piece
    // TODO although it is possible that the closest overlap position is not the cheapest in terms of moves
    if (overlapPositions.length > 0) {
      bestPosition = _.min(overlapPositions, function(pos) {
        return Board.manhattanDistance(pos, piece.position);
      });
      board.movePieceTo(piece, bestPosition);
      return;
    }
  }

  // move closer to the target
  bestPosition = _.min(validPositions, function(pos) {
    return Board.manhattanDistance(pos, tile.position);
  });
  board.movePieceTo(piece, bestPosition);
};

var attackValue = function(attacker, enemy, tile) {
  var enemy = _.clone(enemy),
      threat = tileThreat(tile, enemy);

  // simulate enemy damage
  enemy.health -= attacker.health/2;
  var expectedHealth = attacker.health - enemy.health/2,
      expectedThreatAfter = tileThreat(tile, enemy);

  // reducing bigger threats by a lot is more valuable,
  // but we don't want attackers going on suicide missions
  console.log('-----computing attack value');
  console.log(threat);
  console.log(expectedHealth);
  console.log(expectedThreatAfter);
  return (threat + expectedHealth)/(expectedThreatAfter + 1e-12);
};

var tileThreats = function(board, tile) {
  var nearbyTiles = board.tilesInRange(tile, 3);
  var threat = _.reduce(nearbyTiles, function(t) {
    if (t.piece && t.piece.owner != self.player) {
      return tileThreat(tile, t.piece);
    }
    return 0;
  }, 0);
  return threat;
};

var tileThreat = function(tile, piece) {
    // stronger and closer pieces are more threatening
    return piece.health/Board.manhattanDistance(piece.position, tile.position);
};

const Task = {
  Defend: function(tile) {
    this.tile = tile;
    this.value = 4 * tileValue(tile);
    // any piece can defend
  },
  Capture: function(tile) {
    this.tile = tile;
    this.value = 3 * tileValue(tile);
    this.validPiece = Piece.Product;
  },
  assign: function(task, piece) {
    var t = _.clone(task);
    t.value *= pieceValue(piece, t.tile);
    t.piece = piece;
    return t;
  }
};
Task.Capture.prototype = {
  execute: function(ai, board) {
    ai.log('executing capture task');
    var self = this;

    // if the tile has an enemy piece or empty, beeline for the tile
    if (!this.tile.piece || this.tile.piece.owner !== this.piece.owner) {
      ai.log('->heading to the tile');
      movePieceTowards(board, this.piece, this.tile);
    }

    // if on the piece, capture
    if (_.isEqual(this.piece.position, this.tile.position) && this.piece.moves > 0) {
      ai.log('->capturing the tile');
      this.tile.capture(this.piece);
    }

    // otherwise, the tile is occupied - check vicinity of tile for enemies within reach
    // if an enemy is capturing the tile, they are the highest threat
    if (this.piece.moves > 0) {
      var nearbyTiles = board.tilesInRange(this.tile, 3),
          potentialTargets = _.filter(nearbyTiles, function(tile) {
            return tile.piece && tile.piece.owner != self.piece.owner;
          });

      if (potentialTargets.length > 0) {
        ai.log('->attacking enemies the tile');
        console.log(potentialTargets);
        var target = _.max(potentialTargets, function(target) {
          return attackValue(self.piece, target.piece, self.tile);
        });
        console.log('-----> target');
        console.log(target);
        var attackRange = 1;
        movePieceTowards(board, this.piece, target, attackRange);
        if (this.piece.moves > 0 && _.contains(board.tilesInRange(this.piece.tile, attackRange), target)) {
          board.attackPiece(this.piece, target.piece);
        }
      }
    }

    // if not in vicinity of tile, move towards
    if (this.piece.moves > 0 && Board.manhattanDistance(this.piece.position, this.tile.position) > 3) {
      ai.log('->moving to tile vicinity');
      movePieceTowards(board, this.piece, this.tile, 3);
    }
  }
};
Task.Defend.prototype = {
  execute: function(ai, board) {
    ai.log('->defending');
    var self = this;

    // if the tile has an enemy piece or empty, beeline for the tile
    if (!this.tile.piece || this.tile.piece.owner !== this.piece.owner) {
      movePieceTowards(board, this.piece, this.tile);
    }

    // check vicinity of tile for enemies within reach
    if (this.piece.moves > 0) {
      var nearbyTiles = board.tilesInRange(this.tile, 3),
          potentialTargets = _.filter(nearbyTiles, function(tile) {
            return tile.piece;
          });

      if (potentialTargets.length > 0) {
        var target = _.max(potentialTargets, function(target) {
          return attackValue(self.piece, target, self.tile);
        });
        movePieceTowards(board, this.piece, target.tile, 1);
        if (this.piece.moves > 0) {
          Board.attack(this.piece, target);
        }
      }
    }

    // if not in vicinity of tile, move towards
    if (this.piece.moves > 0 && Board.manhattanDistance(this.piece.position, this.tile.position) > 3) {
      movePieceTowards(board, this.piece, this.tile, 3);
    }
  }
};

export default AI;
