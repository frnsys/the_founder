import _ from 'underscore';
import Grid from 'market/Grid';
import Position from 'market/Position';
import Evaluation from 'market/ai/Evaluation';


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
          piece = {
            owner: 'a',
            health: 5,
            position: new Position(i,j)
          };
        } else if (val === 3) {
          piece = {
            owner: 'b',
            health: 5,
            position: new Position(i,j)
          };
        }
        grid.grid[i][j] = {
          piece: piece,
          position: new Position(i,j)
        };
      } else {
        grid.grid[i][j] = null;
      }
    });
  });
}


describe('AI', function() {
  describe('Evaluation', function() {
    it('piece value varies with piece health and distance to tile', function() {
      var piece = {position: new Position(2,2), health: 5},
          tile = {position: new Position(0,0)},
          val = Evaluation.pieceValue(piece, tile);
      expect(val).toBeGreaterThan(0);

      piece.position = new Position(1,1);
      expect(Evaluation.pieceValue(piece, tile)).toBeGreaterThan(val);

      piece.health = 10;
      expect(Evaluation.pieceValue(piece, tile)).toBeGreaterThan(val);

      piece.position = new Position(0,0);
      expect(Evaluation.pieceValue(piece, tile)).toBeGreaterThan(val);
    });

    it('tile threat varies with piece health and distance to tile', function() {
      var piece = {position: new Position(2,2), health: 5},
          tile = {position: new Position(0,0)},
          val = Evaluation.tileThreat(piece, tile);
      expect(val).toBeGreaterThan(0);

      piece.position = new Position(1,1);
      expect(Evaluation.tileThreat(piece, tile)).toBeGreaterThan(val);

      piece.health = 10;
      expect(Evaluation.tileThreat(piece, tile)).toBeGreaterThan(val);

      piece.position = new Position(0,0);
      expect(Evaluation.tileThreat(piece, tile)).toBeGreaterThan(val);
    });

    it('attack value varies with attacker health, enemy health, and tile distance from enemy', function() {
      var piece = {position: new Position(2,2), health: 5},
          enemy = {position: new Position(2,1), health: 5},
          tile = {position: new Position(0,0)},
          val = Evaluation.attackValue(piece, enemy, tile);
      expect(val).toBeGreaterThan(0);

      piece.health = 10;
      expect(Evaluation.attackValue(piece, enemy, tile)).toBeGreaterThan(val);

      piece.health = 5;
      enemy.health = 10;
      expect(Evaluation.attackValue(piece, enemy, tile)).toBeLessThan(val);

      piece.health = 5;
      enemy.health = 5;
      enemy.position = new Position(0,0);
      expect(Evaluation.attackValue(piece, enemy, tile)).toBeGreaterThan(val);
    });

    it('tile with no nearby enemies should be under no threat', function() {
        var rows = 3, cols = 5,
            grid = new Grid(rows, cols);
        var tileMap = [
          [0,1,1,1,1],
           [1,1,2,1,1],
          [0,1,1,1,0]
        ],
        tile = {position: new Position(1,2)},
        owner = 'a';
        setTiles(grid, tileMap);
        expect(Evaluation.tileThreats(grid, tile, owner)).toEqual(0);
    });

    it('tile with nearby enemies should be under some threat', function() {
        var rows = 3, cols = 5,
            grid = new Grid(rows, cols);
        var tileMap = [
          [0,1,1,1,1],
           [1,1,2,1,3],
          [0,1,1,1,0]
        ],
        tile = {position: new Position(1,2)},
        owner = 'a';
        setTiles(grid, tileMap);

        var threat = Evaluation.tileThreats(grid, tile, owner);
        expect(threat).toBeGreaterThan(0);

        // closer threat should be greater
        var tileMap = [
          [0,1,1,1,1],
           [1,1,2,3,1],
          [0,1,1,1,0]
        ];
        setTiles(grid, tileMap);
        var newThreat = Evaluation.tileThreats(grid, tile, owner);
        expect(newThreat).toBeGreaterThan(threat);
        threat = newThreat;

        // more numerous threat should be greater
        var tileMap = [
          [0,1,1,3,1],
           [1,1,2,3,1],
          [0,1,1,1,0]
        ];
        setTiles(grid, tileMap);
        newThreat = Evaluation.tileThreats(grid, tile, owner);
        expect(newThreat).toBeGreaterThan(threat);
    });
  });
});
