import $ from 'jquery';
import _ from 'underscore';
import util from 'util';
import Popup from 'views/Popup';

const template = data => `
<div class="popup-body">
  <ul class="grid productTypes">
    ${data.items.map(i => `
      <li class="productType">
        <img src="assets/productTypes/${util.slugify(i.name)}.gif">
        <h4>${i.name}</h4>
      </li>
    `).join('')}
  </ul>
  <div class="actions">
    <button class="select" disabled>Confirm</button>
  </div>
</div>
`;

class View extends Popup {
  constructor(player) {
    //player.onboard('create_product'); // TODO move elsewhere
    var selected = [];
    super({
      title: 'Start a Product',
      background: '#f0f0f0',
      template: template,
      handlers: {
        '.select': function() {
          if (selected.length == 2) {
            player.company.startProduct(selected);
            this.remove();
          }
        },
        'li': function(ev) {
          var $el = $(ev.target),
              $li = $el.closest('li'),
              idx = $li.index(),
              sel = player.company.productTypes[idx];
          if (_.contains(selected, sel)) {
            selected = _.without(selected, sel);
            $li.removeClass('selected');
          } else if (selected.length < 2) {
            selected.push(sel);
            $li.addClass('selected');
          }
          var button = this.el.find('.select');
          button.prop('disabled', selected.length !== 2);
          if (selected.length == 0) {
            button.text('Select 2 product types');
          } else if (selected.length == 1) {
            button.text('Select 1 more product type');
          } else {
            button.text('Start');
          }
        }
      }
    })
    this.player = player;
  }

  render() {
    super.render({
      items: this.player.company.productTypes
    });
  }
}

export default View;
