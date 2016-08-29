/*
 * Economy
 * - affected by economic stability
 * TODO
 */

import _ from 'underscore';
import Enums from 'app/Enums';

const Economy = {
  update: function(player) {
    var economyChangeProbability;
    player.economy = player.nextEconomy;
    switch(player.economy) {
      case Enums.Economy.Depression:
        economyChangeProbability = 0.2;
        break;
      case Enums.Economy.Recession:
        economyChangeProbability = 0.1;
        break;
      case Enums.Economy.Neutral:
        economyChangeProbability = 0.005;
        break;
      case Enums.Economy.Expansion:
        economyChangeProbability = 0.16;
        break;
    }
    if (Math.random() <= economyChangeProbability) {
      var downProb = player.economy == 0 ? 0 : Math.min(1, 0.6 / player.economicStability),
          upProb = player.economy == 3 ? 0 : 1 - downProb,
          roll = Math.random();
      if (roll <= downProb) {
        player.nextEconomy = player.economy - 1;
      } else if (roll <= upProb) {
        player.nextEconomy = player.economy + 1;
      }
    } else {
      player.nextEconomy = player.economy;
    }

    if (player.specialEffects["Prescient"]) {
      var prediction;
      if (Math.random() <= 0.65) {
        prediction = enumName(player.nextEconomy, Enums.Economy).toLowerCase();
      } else {
        var options = [player.economy];
        if (player.economy > 0) {
          options.push(player.economy - 1);
        }
        if (player.economy < 3) {
          options.push(player.economy + 1);
        }
        var nextEconomy = _.sample(options);
        prediction = enumName(nextEconomy, Enums.Economy).toLowerCase();
      }
      player.current.emails.push({
        "subject": "[DELPHI] Economic forecast",
        "from": "DELPHI@{{slug name}}.com",
        "body": "Delphi is predicting with 65% certainty that the economy will soon enter into a " + prediction + ". <br /><img src='assets/news/delphi.jpg'>"
      });
    }
  }
}

export default Economy;
