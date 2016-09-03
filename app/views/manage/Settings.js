import _ from 'underscore';
import Popup from 'views/Popup';

const template = data => `
  <ul class="settings-options"></ul>
`;


class View extends Popup {
  constructor(player) {
    super({
      title: 'Settings',
      template: template
    });
    this.player = player;
  }
}

export default View;
