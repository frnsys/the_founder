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
  evaluatePerformance: function(board, profit, graceYearsLeft) {
    // ignore board for the grace period
    if (graceYearsLeft <= 0) {
      var attained = 0;
      if (graceYearsLeft < 0) {
        attained = profit/board.profitTarget;

        // if the target is exceeded, the board is really happy
        if (attained >= 1.8)
            board.happiness += attained * 12;

        // if the target is met, the board is happy
        if (attained >= 1) {
            board.happiness += attained * 10;

        // a negative change is super bad
        } else if (attained < 0) {
            board.happiness -= -attained * 20;

        // otherwise, the board just becomes a bit more unhappy
        } else {
            board.happiness -= (1-attained) * 10;
        }
      }

      // set the new target
      board.profitTarget = Math.round(Math.max(profit, board.profitTarget) * (1 + config.DESIRED_GROWTH));
      return attained;
    }
    return 0;
  },

  mood: function(board) {
    if (board.happiness >= 50) {
      return 'Ecstatic';
    } else if (board.happiness >= 35) {
      return 'Pleased';
    } else if (board.happiness >= 15) {
      return 'Content';
    } else if (board.happiness > 0) {
      return 'Unhappy';
    } else {
      return 'Raging';
    }
  }
};

export default Board;
