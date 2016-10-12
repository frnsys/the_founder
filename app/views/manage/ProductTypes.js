import $ from 'jquery'
import _ from 'underscore';
import util from 'util';
import tmpl from 'views/Common';
import View from 'views/View';
import CardsList from 'views/CardsList';
import productTypes from 'data/productTypes.json';

const difficulties = [
  'Very Easy',
  'Easy',
  'Moderate',
  'Hard',
  'Very Hard'
];

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
        ${item.owned ? `${tmpl.expertise(item)}` : ``}
        <h5 data-tip="Difficulty">${difficulties[item.difficulty-1]}</h5>
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
    this.items = _.map(productTypes, this.processItem.bind(this));
    super.render({
      items: this.items
    });
    this.nProductTypes = this.player.company.productTypes.length;
  }

  update() {
    this.el.find('.current-cash-value').text(
      `Cash: ${util.formatCurrency(this.player.company.cash)}`
    );
  }

  processItem(item) {
    var player = this.player,
        item = _.clone(item);
    item.cost *= this.player.costMultiplier;
    var owned = util.contains(player.company.productTypes, item);
    if (owned) {
      item.expertise = _.findWhere(player.company.productTypes, {name: item.name}).expertise;
    }
    return _.extend({
      owned: owned,
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
