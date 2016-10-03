import $ from 'jquery';
import _ from 'underscore';
import Popup from 'views/Popup';
import Manager from 'app/Manager';
import Confirm from 'views/alerts/Confirm';

const template = data => `
  <ul class="settings-options">
    ${!data.onboardingFinished ? '<li class="skip-onboarding">Skip onboarding</li>' : ''}
    <li class="toggle-music">${data.music ? 'Mute' : 'Unmute'} music</li>
    <li class="save-game">Save game</li>
  </ul>
`;


class View extends Popup {
  constructor(player) {
    super({
      title: 'Settings',
      template: template
    });
    this.player = player;
    this.registerHandlers({
      '.skip-onboarding': function() {
        var self = this;
        var view = new Confirm(function() {
          player.skipOnboarding();

         var name = Manager.game.state.current,
              current = Manager.game.state.states[name];

          if (current.menu) {
            current.menu.render();
          }

          self.render();
        });
        view.render('You sure you want to skip onboarding?');
      },
      '.toggle-music': function() {
        var audio = document.getElementById('music');
        player.settings.music = !player.settings.music;
        audio.muted = !player.settings.music;
        this.render();
      },
      '.save-game': function() {
        player.save();
        $('.save-game').text('Saved!');
      }
    });
  }

  render() {
    var player = this.player;
    super.render(_.extend({
      onboardingFinished: _.every(player.onboarding, function(v, k) {
        return player.onboarding[k].finished;
      })
    }, player.settings));
  }
}

export default View;
