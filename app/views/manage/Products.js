import _ from 'underscore';
import util from 'util';
import Effect from 'game/Effect';
import View from 'views/View';
import CardsList from 'views/CardsList';
import productRecipes from 'data/productRecipes.json';

const effectsTemplate = item => `
<ul class="effects">
  ${item.effects.map(e => `
    <li>${Effect.toString(e)}</li>
  `).join('')}
</ul>`;

function detailTemplate(item) {
  if (item.discovered) {
    return `
      <div class="title">
        <h1>${item.name.replace('.', ' + ')}</h1>
      </div>
      ${item.productTypes.map(pt => `
        <img src="assets/productTypes/${util.slugify(pt)}.gif">
      `).join('')}
      ${item.effects.length > 0 ? effectsTemplate(item) : ''}`;
  } else {
    return `
      <div class="title">
        <h1>???</h2>
      </div>
      <img src="assets/placeholder.gif">
    `;
  }
}


class ProductsView extends CardsList {
  constructor(player) {
    super({
      title: 'Discovered Products',
      detailTemplate: detailTemplate
    });
    this.player = player;
  }

  render() {
    var player = this.player;
    super.render({
      items: _.map(productRecipes, i => _.extend({
        discovered: _.contains(player.company.discoveredProducts, i.name)
      }, i))
    });
  }

  createListItem(item) {
    return new View({
      tag: 'li',
      parent: this.el.find('ul'),
      template: this.detailTemplate,
      method: 'append',
      attrs: {
        class: item.discovered ? '' : 'locked'
      }
    });
  }
}

export default ProductsView;
