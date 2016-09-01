import _ from 'underscore';
import Grid from '../Grid';
import Evaluation from './Evaluation';


class Task {
  constructor(tile, grid) {
    this.tile = tile;
    this.value = 0;
    this.grid = grid;
  }

  assign(piece) {
    this.value *= Evaluation.pieceValue(piece, this.tile);
    this.piece = piece;
  }

  clone() {}
  execute(board, cb) {}

  moveTowards(board, cb) {
    // if the tile has an enemy piece or empty, beeline for the tile
    if (!this.tile.piece) {
      console.log(`>> moving towards C${this.tile.position.col}:R${this.tile.position.row}`);
      board.movePieceTo(this.piece, this.tile.position, null, cb);
    } else if (this.tile.piece.owner !== this.piece.owner) {
      console.log(`>> moving towards C${this.tile.position.col}:R${this.tile.position.row} (target enemy)`);
      board.movePieceTo(this.piece, this.tile.position, this.tile.piece, cb);
    } else {
      cb();
    }
  }

  capture(board, cb) {
    // if on the piece, capture
    if (_.isEqual(this.piece.position, this.tile.position) && this.piece.moves > 0) {
      console.log('>> capturing');
      this.tile.capture(this.piece);
    }
    cb();
  }

  attackNearby(board, cb) {
    // otherwise, the tile is occupied - check vicinity of tile for enemies within reach
    // if an enemy is capturing the tile, they are the highest threat
    var grid = this.grid;
    if (this.piece.moves > 0) {
      console.log('>> attacking nearby');
      var nearbyTiles = grid.tilesInRange(this.tile.position, 2),
          potentialTargets = _.filter(nearbyTiles,
            tile => tile.piece && tile.piece.owner != this.piece.owner);

      if (potentialTargets.length > 0) {
        var targetTile = _.max(potentialTargets, t => Evaluation.attackValue(this.piece, t.piece, this.tile)),
            range = 1,
            self = this;
        console.log('target tile:');
        console.log(targetTile);
        board.movePieceTo(this.piece, targetTile.position, targetTile.piece, function() {
          if (self.piece.moves > 0 && _.contains(grid.tilesInRange(self.piece.tile.position, range), targetTile)) {
            board.attackPiece(self.piece, targetTile.piece);
          }
          cb();
        });
      } else {
        cb();
      }
    } else {
      cb();
    }
  }
}

class CaptureTask extends Task {
  constructor(tile, grid) {
    super(tile, grid)
    this.value = Math.pow(10 * Evaluation.tileValue(tile), 2);
    // console.log(`Capture value: ${this.value}`);
  }

  clone() {
    return new CaptureTask(this.tile, this.grid);
  }

  execute(board, cb) {
    var piece = this.piece;
    this.moveTowards(board,
      _.partial(this.capture.bind(this), board,
        _.partial(this.attackNearby.bind(this), board, function() {
          piece.done = true;
          cb();
        })));
  }
}

class DefendTask extends Task {
  constructor(tile, grid, threat) {
    super(tile, grid)
    this.threat = threat;
    this.value = 4 * Evaluation.tileValue(tile) * threat;
    // console.log(`Defend value: ${this.value}`);
  }

  clone() {
    return new DefendTask(this.tile, this.grid, this.threat);
  }

  execute(board, cb) {
    var piece = this.piece;
    this.moveTowards(board,
      _.partial(this.attackNearby.bind(this), board, function() {
        piece.done = true;
        cb();
      }));
  }
}

export default {
  Defend: DefendTask,
  Capture: CaptureTask
}
