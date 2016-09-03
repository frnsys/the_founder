/*
 * Onboarding
 * - shows onboarding ('Mentor') messages when its associated conditions are satisfied
 * - if a UI selector is specified, it is highlighted (pulsed), which stops on click
 */

import $ from 'jquery';
import _ from 'underscore';
import Popup from 'views/Popup';
import Mentor from 'views/alerts/Mentor';
import Condition from 'game/Condition';

class Onboarding {
  constructor(manager) {
    this.manager = manager;
    this.player = manager.player;
  }

  resolve() {
    if (!Mentor.exists) {
      // only resolve at most one onboarding event per call
      var player = this.player,
          manager = this.manager;
      var toResolve = _.find(this.player.onboarding, function(o) {
        var satisfied = true;
        if (o.conditions) {
          satisfied = _.every(o.conditions, c => Condition.satisfied(c, player));
        } else if (o.popup) {
          satisfied = Popup.current && Popup.current.title == o.popup;
        } else if (o.market) {
          satisfied = manager.game.state.current == 'Market';
        }
        return !o.finished && satisfied;
      });
      if (toResolve) {
        var mentor = new Mentor(toResolve.messages);
        mentor.render();
        toResolve.finished = true;
        if (toResolve.uiSelector) {
          // update ui
          var name = this.manager.game.state.current,
              current = this.manager.game.state.states[name];
          if (current.menu) {
            current.menu.render();
          }
          $(toResolve.uiSelector).addClass('pulse');
        }
        return true;
      }
    }
    return false;
  }
}

$('body').on('click', '.pulse', function() {
  $(this).removeClass('pulse');
});
export default Onboarding;
