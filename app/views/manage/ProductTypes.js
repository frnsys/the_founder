import $ from 'jquery'
import _ from 'underscore';
import util from 'util';
import Popup from 'views/Popup';
import productTypes from 'data/productTypes.json';

function template(data) {
  var products = data.items.map(function(i) {
    if (i.owned) {
      return `
        <li class="owned">
          <div class="productType">
            <img src="assets/productTypes/${util.slugify(i.name)}.gif">
            <h4>${i.name}</h4>
          </div>
          <button disabled>Owned</button>
        </li>
      `;
    } else if (i.available) {
      var button;
      if (i.afford) {
        button = `<button class="buy">${util.formatCurrency(i.cost)}</button>`;
      } else {
        button = `<button disabled>${util.formatCurrency(i.cost)}</button>`;
      }
      return `<li class="available">
        <div class="productType">
          <img src="assets/productTypes/${util.slugify(i.name)}.gif">
          <h4>${i.name}</h4>
        </div>
        ${button}
      </li>`;
    } else {
      return `
        <li class="locked">
          <div class="productType">
            <img src="assets/placeholder.gif">
            <h4>???</h4>
          </div>
          <button disabled>Locked</button>
        </li>
      `;
    }
  }).join('');
  return `
    <ul class="grid popup-body productTypes">
      ${products}
    </ul>
  `;
}


class View extends Popup {
  constructor(player) {
    super({
      title: 'Product Types',
      background: '#f0f0f0',
      template: template,
      handlers: {
        '.buy': function(ev) {
          var $el = $(ev.target),
              idx = $el.closest('li').index(),
              sel = productTypes[idx];
          player.company.buyProductType(sel);
          this.render();
        }
      }
    });
    this.player = player;
  }

  render() {
    var player = this.player;
    player.onboard('productTypes'); // TODO should be handled by the manager
    super.render({
      items: _.map(productTypes, function(pt) {
        return _.extend({
          owned: util.contains(player.company.productTypes, pt),
          available: player.company.productTypeIsAvailable(pt),
          afford: player.company.cash >= pt.cost
        }, pt)
      })
    });
  }
}

export default View;
