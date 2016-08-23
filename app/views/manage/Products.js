import _ from 'underscore';
import util from 'util';
import Popup from 'views/Popup';
import Effect from 'game/Effect';
import productRecipes from 'data/productRecipes.json';

function template(data) {
  var products = data.items.map(function(i) {
    if (i.discovered) {
      return `
        <li class="discovered">
          ${i.productTypes.map(pt => `
            <img src="assets/productTypes/${util.slugify(pt)}.gif">
          `).join('')}
          <h4>${i.name}</h4>
          <ul class="effects">
            ${i.effects.map(e => `
              <li>${Effect.toString(e)}</li>
            `).join('')}
          </ul>
      `;
    } else {
      return `
        <li class="locked">
          <img src="assets/placeholder.gif">
          <h4>???</h4>
        </li>
      `;
    }
  }).join('');
  return `
    <ul class="grid popup-body products">
      ${products}
    </ul>
  `;
}


class View extends Popup {
  constructor(player) {
    super({
      title: 'Discovered Products',
      background: '#f0f0f0',
      template: template
    });
    this.player = player;
  }

  render() {
    var player = this.player;
    super.render({
      items: _.map(productRecipes, function(pr) {
        return _.extend({
          discovered: _.contains(player.company.discoveredProducts, pr.name),
          name: pr.name.replace('.', ' + ')
        }, pr)
      })
    });
  }
}

export default View;

