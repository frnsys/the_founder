import _ from 'underscore';
import util from 'util';
import SelectView from './Select';

const template = data => `
<header class="selection-header">
  <img class="selection-avatar" src="assets/perks/gifs/${util.slugify(data.name)}.gif">
  <div class="selection-name">
    <h2>${data.name}</h2>
  </div>
</header>
<div class="selection-body">
  <p>${data.description}</p>
  <div class="object-stats">
    <h5>Weekly Stats</h5>
    <ul>
      ${_.map(data.statValues, (i, k) => `
        <li><strong>${k}:</strong> ${i.toLocaleString()}</li>
      `).join('')}
    </ul>
  </div>
</div>
`

class View extends SelectView {
  constructor() {
    super({
      template: template,
    });
  }

  update(obj) {
    this.render(obj);
  }
}

export default View;
