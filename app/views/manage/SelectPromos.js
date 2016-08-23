import $ from 'jquery';
import _ from 'underscore';
import util from 'util';
import Popup from 'views/Popup';
import promos from 'data/promos.json';

const template = data => `
<div class="popup-body">
  <ul class="grid promos">
    ${data.items.map(i => `
      <li class="promo ${i.afford ? '' : 'disabled'}">
        <img src="assets/promos/${util.slugify(i.name)}.png">
        <h4>${i.name}</h4>
        <h4>${util.formatCurrency(i.cost)}</h4>
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
    var selected;
    super({
      title: 'Start a Promo Campaign',
      background: '#f0f0f0',
      template: template,
      handlers: {
        '.select': function() {
          if (selected && player.company.buyPromo(selected)) {
            this.remove();
          }
        },
        'li': function(ev) {
          var $el = $(ev.target),
              $li = $el.closest('li'),
              idx = $li.index(),
              sel = promos[idx];
          if (player.company.cash >= sel.cost) {
            selected = sel;
            this.el.find('.selected').removeClass('selected');
            $li.addClass('selected');
            this.el.find('.select').prop('disabled', false);
          }
        }
      }
    })
    this.player = player;
  }

  render() {
    var player = this.player;
    super.render({
      items: _.map(promos, function(p) {
        return _.extend({
          afford: player.company.cash >= p.cost
        }, p);
      })
    });
  }
}

export default View;

