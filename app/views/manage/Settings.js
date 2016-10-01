import _ from 'underscore';
import Popup from 'views/Popup';
import Confirm from 'views/alerts/Confirm';

const template = data => `
  <ul class="settings-options">
    ${!data.onboardingFinished ? '<li class="skip-onboarding">Skip onboarding</li>' : ''}
    <li class="toggle-music">${data.music ? 'Mute' : 'Unmute'} music</li>
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
          self.render();
        });
        view.render('You sure you want to skip onboarding?');
      },
      '.toggle-music': function() {
        var audio = document.getElementById('music');
        player.settings.music = !player.settings.music;
        audio.muted = !player.settings.music;
        this.render();
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
