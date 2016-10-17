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
import Task from './Task';
import Evaluation from './Evaluation';

class AI {
  constructor(board, player) {
    this.board = board;
    this.grid = board.grid;
    this.player = player;
  }

  planTasks() {
    // console.log('planning task');
    var assignedTasks = [],
        unassignedTasks = [];

    // consider all possible tasks
    if (this.player.pieces.length > 0) {
      var taskQueue = _.chain(this.grid.tiles)
        .map(this.tasksForTile.bind(this))
        .flatten().value();

      // sort tasks by value
      taskQueue = _.sortBy(taskQueue, 'value').reverse();

      var unassignedPieces = _.filter(this.player.pieces, p => p.moves > 0 && !p.done);
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

  tasksForTile(tile) {
    var val = Evaluation.tileValue(tile),
        tasks = []

    if (tile.owner == this.player) {
      var threatValue = Evaluation.tileThreats(this.grid, tile);
      if (threatValue > 0) {
        tasks.push(new Task.Defend(tile, this.grid, threatValue));
      }
    } else if (!_.isUndefined(tile.baseCost)) {
      tasks.push(new Task.Capture(tile, this.grid));
    }

    // consider all assignments to each task
    tasks = _.chain(tasks)
      .map(this.generateAssignments.bind(this))
      .flatten().value();
    return tasks;
  }

  generateAssignments(task) {
    return _.chain(this.player.pieces)
      .filter(p => p.moves > 0)
      .map(function(piece) {
        var t = task.clone();
        t.assign(piece);
        return t;
      }).value();
  }

  takeTurn(onFinishTurn) {
    this.onFinishTurn = onFinishTurn;
    _.each(this.player.pieces, p => p.done = false);
    this.planAndExecute();
  }

  planAndExecute() {
    if(_.some(this.player.pieces, p => !p.done)) {
      var tasks = this.planTasks();
      this.execute(tasks[0]);
    } else {
      this.onFinishTurn();
    }
  }

  execute(task) {
    // console.log('executing task');
    // console.log(task);
    task.execute(this.board, this.planAndExecute.bind(this));
  }
}

export default AI;
