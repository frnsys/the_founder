import _ from 'underscore';
import Grid from 'market/Grid';
import Position from 'market/Position';

function setTiles(grid, tileMap) {
  _.each(tileMap, function(row, i) {
    _.each(row, function(val, j) {
      // 0 -> no tile
      // 1 -> unoccupied tile
      // 2 -> tile with piece
      // 3 -> tile with enemy piece
      if (val > 0) {
        var piece = null;
        if (val === 2) {
          piece = {owner: 'a'};
        } else if (val === 3) {
          piece = {owner: 'b'};
        }
        grid.grid[i][j] = {
          position: new Position(i,j),
          piece: piece
        };
      } else {
        grid.grid[i][j] = null;
      }
    });
  });
}

describe('Grid', function() {
  var grid, rows = 3, cols = 5;
  beforeEach(function() {
    grid = new Grid(rows, cols);
  });

  it('is created with proper rows and columns', function() {
    expect(grid.grid.length).toEqual(rows);
    expect(_.every(grid.grid, r => r.length == cols)).toEqual(true);
  });

  it('gets all tiles', function() {
    var tileMap = [
      [0,1,1,0,1],
       [1,1,0,1,1],
      [0,1,1,1,0]
    ];
    expect(grid.tiles.length).toEqual(0);
    setTiles(grid, tileMap);
    expect(grid.tiles.length).toEqual(10);
  });

  it('checks position validity', function() {
    var badPositions = [
      new Position(-10, 1),
      new Position(100, 1),
      new Position(1, -10),
      new Position(1, 100),
      new Position(-10, -10),
      new Position(100, 100)
    ];
    _.each(badPositions, p => expect(grid.isValidPosition(p)).toEqual(false));

    var goodPositions = [
      new Position(0, 0),
      new Position(0, 1),
      new Position(1, 2),
      new Position(2, 2),
      new Position(2, 4)
    ];
    _.each(goodPositions, p => expect(grid.isValidPosition(p)).toEqual(true));
  });

  it('gets valid adjacent positions', function() {
    /* FYI it's a hex grid, so:
     * (){}{}()()
     *  {}[]{}()()
     * (){}{}()()
     * the [] position is the one we are testing
     * the {} positions are those we expect to get
     */
    var pos = new Position(1,1),
        expectedAdj = [
          new Position(0,1),
          new Position(0,2),
          new Position(1,0),
          new Position(1,2),
          new Position(2,1),
          new Position(2,2)
        ];
    expect(grid.adjacentPositions(pos)).toEqual(expectedAdj);
  });

  it('does not get invalid adjacent positions', function() {
    /*
     * ()()()()()
     *  ()()(){}{}
     * ()()(){}[]
     */
    var pos = new Position(2,4),
        expectedAdj = [
          new Position(1,3),
          new Position(1,4),
          new Position(2,3)
        ];
    expect(grid.adjacentPositions(pos)).toEqual(expectedAdj);
  });

  it('gets adjacent positions without tiles', function() {
    var tileMap = [
      [0,0,1,0,1],
       [0,0,0,1,1],
      [0,0,0,0,0]
    ];
    setTiles(grid, tileMap);
    var pos = new Position(1,3),
        expectedAdj = [
          new Position(0,3),
          new Position(1,2),
          new Position(2,3),
          new Position(2,4)
        ];
    expect(grid.adjacentNoTilePositions(pos)).toEqual(expectedAdj);
  });

  it('gets adjacent positions with tiles', function() {
    var tileMap = [
      [0,0,1,0,1],
       [0,0,0,1,1],
      [0,0,0,0,0]
    ];
    setTiles(grid, tileMap);
    var pos = new Position(1,3),
        expectedAdj = [
          new Position(0,4),
          new Position(1,4)
        ];
    expect(grid.adjacentTilePositions(pos)).toEqual(expectedAdj);
  });

  it('gets adacent tile positions that have no piece', function() {
    var tileMap = [
      [0,0,0,0,2],
       [0,0,0,1,1],
      [0,0,0,1,0]
    ];
    setTiles(grid, tileMap);
    var pos = new Position(1,3),
        expectedAdj = [
          new Position(1,4),
          new Position(2,3)
        ];
    expect(grid.adjacentUnoccupiedTilePositions(pos)).toEqual(expectedAdj);
  });

  it('gets tiles within a specific range', function() {
    var tileMap = [
      [1,0,1,1,1],
       [1,0,0,1,1],
      [1,0,0,1,0]
    ];
    setTiles(grid, tileMap);
    expect(grid.tilesInRange(pos, 0)).toEqual([]);

    var pos = new Position(1,3),
        expectedAdj = _.map([
          new Position(0,3),
          new Position(0,4),
          new Position(1,4),
          new Position(2,3)
        ], p => ({position: p, piece: null}));
    expect(grid.tilesInRange(pos, 1)).toEqual(expectedAdj);

    var pos = new Position(1,3),
        expectedAdj = _.map([
          new Position(0,3),
          new Position(0,4),
          new Position(1,4),
          new Position(2,3),
          new Position(0,2)
        ], p => ({position: p, piece: null}));
    expect(grid.tilesInRange(pos, 2)).toEqual(expectedAdj);
  });


  describe('pathfinding', function() {
    it('finds a path between two tiles', function() {
      var tileMap = [
        [0,0,1,1,0],
         [0,1,0,0,0],
        [0,0,1,1,0]
      ];
      setTiles(grid, tileMap);

      var from = new Position(2,3),
          to = new Position(0,3),
          path = grid.findPath(from, to, tile => !tile.piece),
          expected = [
            new Position(2,2),
            new Position(1,1),
            new Position(0,2),
            new Position(0,3)
          ];
      expect(path).toEqual(expected);
    });

    it('finds the shortest path between two tiles', function() {
      var tileMap = [
        [0,0,1,1,0],
         [0,1,0,1,0],
        [0,0,1,1,0]
      ];
      setTiles(grid, tileMap);

      var from = new Position(2,3),
          to = new Position(0,3),
          path = grid.findPath(from, to, tile => !tile.piece),
          expected = [
            new Position(1,3),
            new Position(0,3)
          ];
      expect(path).toEqual(expected);
    });


    it('obeys the validate predicate', function() {
      var tileMap = [
        [0,0,1,1,0],
         [0,1,0,2,0],
        [0,0,1,1,0]
      ];
      setTiles(grid, tileMap);

      var from = new Position(2,3),
          to = new Position(0,3),
          path = grid.findPath(from, to, tile => !tile.piece),
          expected = [
            new Position(2,2),
            new Position(1,1),
            new Position(0,2),
            new Position(0,3)
          ];
      expect(path).toEqual(expected);
    });
  });

  describe('valid moves', function() {
    it('gives valid movement positions', function() {
      var tileMap = [
        [0,0,0,1,1],
         [0,1,1,2,0],
        [0,0,0,1,0]
      ];
      setTiles(grid, tileMap);
      var tile = grid.tileAt(new Position(1,3)),
          validPositions = grid.validMovePositions(tile, 2),
          expected = [
            new Position(0,3),
            new Position(0,4),
            new Position(1,2),
            new Position(2,3),
            new Position(1,1)
          ];
      expect(validPositions).toEqual(expected);
    });

    it('is not blocked by friendlies but friendly occupied tiles are invalid destinations', function() {
      var tileMap = [
        [0,0,0,1,1],
         [0,1,2,2,0],
        [0,0,0,1,0]
      ];
      setTiles(grid, tileMap);
      var tile = grid.tileAt(new Position(1,3)),
          validPositions = grid.validMovePositions(tile, 2),
          expected = [
            new Position(0,3),
            new Position(0,4),
            new Position(2,3),
            new Position(1,1)
          ];
      expect(validPositions).toEqual(expected);
    });

    it('is blocked by enemies and enemy occupied tiles are valid destinations', function() {
      var tileMap = [
        [0,0,0,1,1],
         [0,1,3,2,0],
        [0,0,0,1,0]
      ];
      setTiles(grid, tileMap);
      var tile = grid.tileAt(new Position(1,3)),
          validPositions = grid.validMovePositions(tile, 2),
          expected = [
            new Position(0,3),
            new Position(0,4),
            new Position(1,2),
            new Position(2,3)
          ];
      expect(validPositions).toEqual(expected);
    });

  });
});


