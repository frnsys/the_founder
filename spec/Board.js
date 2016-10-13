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
    var graceYearsLeft = -1;
    var growth = Board.evaluatePerformance(board, profit, graceYearsLeft);
    expect(growth).toBeCloseTo(1);
  });

  it('sets new profit target', function() {
    var profit = 2,
        profitTarget = board.profitTarget,
        graceYearsLeft = -1;
    Board.evaluatePerformance(board, profit, graceYearsLeft);
    expect(board.profitTarget).toBeGreaterThan(profitTarget);
  });

  it('is happier with more growth', function() {
    var happiness = board.happiness,
        profit = board.lastProfit * (1.1+Board.desiredGrowth),
        graceYearsLeft = -1;
    Board.evaluatePerformance(board, profit, graceYearsLeft);
    expect(board.happiness).toBeGreaterThan(happiness);
  });

  it('is unhappier with less growth', function() {
    var happiness = board.happiness,
        profit = board.lastProfit * (Board.desiredGrowth/2),
        graceYearsLeft = -1;
    Board.evaluatePerformance(board, profit, graceYearsLeft);
    expect(board.happiness).toBeLessThan(happiness);
  });
});



