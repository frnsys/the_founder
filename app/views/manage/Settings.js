import _ from 'underscore';
import Popup from 'views/Popup';

const template = data => `
  <h1>todo</h1>
`;


class View extends Popup {
  constructor(player) {
    super({
      title: 'Settings',
      background: 'rgb(243, 227, 255)',
      template: template
    });
    this.player = player;
  }
}

export default View;
