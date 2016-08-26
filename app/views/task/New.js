import $ from 'jquery';
import _ from 'underscore';
import Popup from 'views/Popup';
import Promos from './Promos';
import Products from './Products';
import Lobbying from './Lobbying';
import Research from './Research';
import SpecialProjects from './SpecialProjects';

const menuItems = [
  ['promo', 'Promo'],
  ['specialProject', 'Special Project'],
  ['lobbying', 'Lobbying'],
  ['research', 'Research']
];

const template = data => `
<ul class="new-task">
  <li class="start-product">
    <h1>Product</h1>
  </li>
  ${_.map(menuItems, function(v) {
    if (data.onboarding[v[0]]) {
      return `
        <li class="start-${v[0]}">
          <h1>${v[1]}</h1>
        </li>`
    } else {
      return '';
    }
  }).join('')}
</ul>
`;

class NewTaskView extends Popup {
  constructor(player) {
    super({
      title: 'New Task',
      template: template
    });
    this.player = player;
    this.registerHandlers({
      '.start-specialProject': this.showView(SpecialProjects),
      '.start-lobbying': this.showView(Lobbying),
      '.start-research': this.showView(Research),
      '.start-product': this.showView(Products),
      '.start-promo': this.showView(Promos)
    });
  }

  showView(view) {
    var player = this.player;
    return function(e) {
      var v = new view(player);
      v.render();
    }
  }

  render() {
    super.render(this.player.snapshot);
  }
}

export default NewTaskView;
