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
      fringe = _.flatten(_.map(fringe, pos => this.adjacentTilePositions(pos)));
      tiles = _.union(tiles, _.map(fringe, pos => this.tileAt(pos)));
      range--;
    }
    return tiles;
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

export default Grid;
