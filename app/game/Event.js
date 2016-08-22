import 'pixi';
import 'p2';
import * as Phaser from 'phaser';
import _ from 'underscore';

const Event = {
  onEvent: new Phaser.Signal(),
  satisfied: function(event, player) {
    var self = this;
    return _.every(event.conditions, function(condition) {
      return self.condition.satisfied(condition, player);
    });
  },
};

Event.condition = {
  operators: {
    eq: function(a, b) { return a == b; },
    gt: function(a, b) { return a > b; },
    ge: function(a, b) { return a >= b; },
    lt: function(a, b) { return a < b; },
    le: function(a, b) { return a <= b; }
  },
  satisfied: function(cond, player) {
    return this.operators[cond.op](this[cond.type](player), cond.val);
  },

  hype: function(player) { return player.company.hype; },
  cash: function(player) { return player.company.cash; },
  annualRevenue: function(player) { return player.company.annualRevenue; },
  productsLaunched: function(player) { return player.company.productsLaunched; },
  locations: function(player) { return player.company.locations.length; },
  employees: function(player) { return player.company.workers.length; },
  officeLevel: function(player) { return player.company.office; },
  technologies: function(player) { return player.company.technologies.length; },
  deathToll: function(player) { return player.company.deathToll; },
  pollution: function(player) { return player.company.pollution; },
  debtOwned: function(player) { return player.company.debtOwned; },
  marketSharePercent: function(player) { return player.company.marketSharePercent; },
  forgettingRate: function(player) { return player.forgettingRate; },
  wageMultiplier: function(player) { return player.wageMultiplier; },
  spendingMultiplier: function(player) { return player.spendingMultiplier; },
  year: function(player) { return player.year; }
};

Event.tick = function(player) {
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
      self.onEvent.dispatch(event);
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
