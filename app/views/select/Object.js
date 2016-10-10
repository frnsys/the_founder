import _ from 'underscore';
import util from 'util';
import SelectView from './Select';

const template = data => `
<img class="selection-avatar object-selection-avatar" src="assets/perks/gifs/${util.slugify(data.name)}.gif">
<header class="selection-header">
  <div class="selection-name">
    <h2>${data.name}</h2>
  </div>
</header>
<div class="selection-body">
  <p>${data.description}</p>
  <div class="object-stats">
    <h5>Weekly Stats</h5>
    <ul>
    </ul>
  </div>
</div>`;

const statsTemplate = data => `
  ${_.map(data.statValues, (i, k) => `
    <li><strong>${k}:</strong> ${i.toLocaleString()}</li>
  `).join('')}`;

class View extends SelectView {
  constructor() {
    super({
      template: template,
    });
  }

  update(obj) {
    this.el.find('ul').html(statsTemplate(obj));
  }
}

export default View;
