import 'pixi';
import 'p2';
import * as Phaser from 'phaser';
import _ from 'underscore';
import Condition from './Condition';

const Event = {
  satisfied: function(event, player) {
    var self = this;
    return _.every(event.conditions, function(condition) {
      return Condition.satisfied(condition, player);
    });
  },
};

Event.tick = function(player, onEvent) {
  var self = this,
      toResolve = [];

  _.each(player.events.pool, function(event) {
    event.countdown -= 1;
    if (event.countdown <= 0) {
      toResolve.push(event);
    }
  });

  var triggered = false;
  for (var i=0; i < toResolve.length; i++) {
    var event = toResolve[i];
    if (!triggered && Math.random() < event.probability) {
      onEvent(event);
      triggered = true;

      // if not repeatable, remove
      if (!event.repeatable) {
        player.events.pool = _.without(player.events.pool, event);

      // otherwise, reset the countdown
      } else {
        event.countdown = _.random(1, 5);
      }
    }
  }
};

export default Event;
