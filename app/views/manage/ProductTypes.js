import $ from 'jquery'
import _ from 'underscore';
import util from 'util';
import View from 'views/View';
import CardsList from 'views/CardsList';
import productTypes from 'data/productTypes.json';

function button(item) {
  if (!item.available) {
      return '<button disabled>Locked</button>';
  } else {
    if (item.owned) {
      return '<button class="owned" disabled>Owned</button>';
    } else if (item.afford) {
      return `<button class="buy">${util.formatCurrency(item.cost)}</button>`;
    } else {
      return `<button disabled>${util.formatCurrency(item.cost)}</button>`;
    }
  }
}

function detailTemplate(item) {
  if (item.available) {
    return `
      <div class="title">
        <h1>${item.name}</h1>
      </div>
      <img src="assets/productTypes/${util.slugify(item.name)}.gif">
      ${button(item)}`;
  } else {
    return `
      <div class="title">
        <h1>???</h1>
      </div>
      <img src="assets/placeholder.gif">
      ${button(item)}`;
  }
}

class ProductTypesView extends CardsList {
  constructor(player) {
    super({
      title: 'Product Types',
      detailTemplate: detailTemplate,
      handlers: {
        '.buy': function(ev) {
          var $el = $(ev.target),
              idx = $el.closest('li').index(),
              sel = productTypes[idx];
          player.company.buyProductType(sel);
          this.subviews[idx].render(this.processItem(sel));
        }
      }
    });
    this.player = player;
  }

  render() {
    super.render({
      items: _.map(productTypes, this.processItem.bind(this))
    });
  }

  update() {
    var self = this;
    // TODO what if a product type becomes unlocked by a tech?
    _.each(_.zip(productTypes, this.subviews), function(v) {
      v[1].el.find('button').replaceWith(button(self.processItem(v[0])));
    });
  }

  processItem(item) {
    var player = this.player;
    return _.extend({
      owned: util.contains(player.company.productTypes, item),
      available: player.company.productTypeIsAvailable(item),
      afford: player.company.cash >= item.cost
    }, item);
  }

  createListItem(item) {
    return new View({
      tag: 'li',
      parent: this.el.find('ul'),
      template: this.detailTemplate,
      method: 'append',
      attrs: {
        class: item.available ? '' : 'locked'
      }
    });
  }
}

export default ProductTypesView;
