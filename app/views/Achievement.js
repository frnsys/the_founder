import $ from 'jquery';
import _ from 'underscore';
import View from './View';
import Condition from 'game/Condition';

const template = data => `
  <h5>Challenge Completed!</h5>
  <h1>${data.name}</h1>
  <p>${Condition.toString(data.condition)}</p>
`;

class Achievement extends View {
  constructor(achievement) {
    super({
      parent: '.achievement-wrapper',
      template: template,
      attrs: {class: 'achievement'},
      method: 'append'
    });
    this.achievement = achievement;
  }

  render() {
    super.render(this.achievement);
    setTimeout(() => {
      this.el.fadeOut(800, () => {
        this.remove();
      });
    }, 8000);
  }
}

export default Achievement;
