/*
 * The Board
 * - sets annual profit target
 * - has a mood (happiness) which fluctuates according to profit growth
 *   - mood worsens if the player fails to meet the profit target
 *   - if the mood is too bad for too long, the player loses
 */

import config from 'config';

const epsilon = 1e-12;
const Board = {
  desiredGrowth: config.DESIRED_GROWTH,
  evaluatePerformance: function(board, profit) {
    var growth = (profit - board.lastProfit)/(board.lastProfit + epsilon);

    // if the target is exceeded, the board is really happy
    if (growth >= config.DESIRED_GROWTH * 2)
        board.happiness += growth * 12;

    // if the target is met, the board is happy
    if (growth >= config.DESIRED_GROWTH) {
        board.happiness += growth * 10;

    // a negative change is super bad
    } else if (growth < 0) {
        board.happiness -= -growth * 20;

    // otherwise, the growth just becomes a bit more unhappy
    } else {
        board.happiness -= (1-growth) * 10;
    }

    // set the new target
    board.lastProfitTarget = board.profitTarget;
    board.profitTarget *= 1 + config.DESIRED_GROWTH;
    board.profitTarget = Math.round(board.profitTarget);
    board.lastProfit = profit;

    return growth;
  },

  mood: function(board) {
    if (board.happiness >= 50) {
      return 'Ecstatic';
    } else if (board.happiness >= 35) {
      return 'Pleased';
    } else if (board.happiness >= 10) {
      return 'Content';
    } else if (board.happiness > 0) {
      return 'Unhappy';
    } else {
      return 'Raging';
    }
  }
};

export default Board;
