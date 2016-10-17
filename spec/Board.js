import _ from 'underscore';
import Board from 'game/Board';
import Player from 'app/Player';

describe('Board', function() {
  var player, board;
  beforeEach(function() {
    player = new Player();
    board = player.board;
    board.profitTarget = 2000;
  });

  it('computes profit target attainment', function() {
    var profit = 2000;
    var graceYearsLeft = -1;
    var attainment = Board.evaluatePerformance(board, profit, graceYearsLeft);
    expect(attainment).toBe(1);
  });

  it('sets new profit target', function() {
    var profit = 2000,
        profitTarget = board.profitTarget,
        graceYearsLeft = -1;
    Board.evaluatePerformance(board, profit, graceYearsLeft);
    expect(board.profitTarget).toBeGreaterThan(profitTarget);
  });

  it('is happier with more growth', function() {
    var happiness = board.happiness,
        profit = 4000,
        graceYearsLeft = -1;
    Board.evaluatePerformance(board, profit, graceYearsLeft);
    expect(board.happiness).toBeGreaterThan(happiness);
  });

  it('is unhappier with less growth', function() {
    var happiness = board.happiness,
        profit = 1000,
        graceYearsLeft = -1;
    Board.evaluatePerformance(board, profit, graceYearsLeft);
    expect(board.happiness).toBeLessThan(happiness);
  });
});



