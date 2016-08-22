import _ from 'underscore';
import Board from 'game/Board';
import Player from 'app/Player';

describe('Board', function() {
  var player, board;
  beforeEach(function() {
    player = new Player();
    board = player.board;
    board.lastProfit = 1;
  });

  it('computes growth', function() {
    var profit = 2;
    var growth = Board.evaluatePerformance(board, profit);
    expect(growth).toBeCloseTo(1);
  });

  it('sets new profit target', function() {
    var profit = 2,
        profitTarget = board.profitTarget;
    Board.evaluatePerformance(board, profit);
    expect(board.profitTarget).toBeGreaterThan(profitTarget);
  });

  it('is happier with more growth', function() {
    var happiness = board.happiness,
        profit = board.lastProfit * (1.1+Board.desiredGrowth);
    Board.evaluatePerformance(board, profit);
    expect(board.happiness).toBeGreaterThan(happiness);
  });

  it('is unhappier with less growth', function() {
    var happiness = board.happiness,
        profit = board.lastProfit * (Board.desiredGrowth/2);
    Board.evaluatePerformance(board, profit);
    expect(board.happiness).toBeLessThan(happiness);
  });
});



