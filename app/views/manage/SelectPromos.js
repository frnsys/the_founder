import $ from 'jquery';
import _ from 'underscore';
import util from 'util';
import View from 'views/View';
import CardsList from 'views/CardsList';
import promos from 'data/promos.json';

const template = data => `
<ul class="cards"></ul>
<div class="actions">
  <button class="select" disabled>Confirm</button>
</div>`;

const detailTemplate = item => `
<div class="title">
  <h1>${item.name}</h1>
  <h4 class="cash">${util.formatCurrency(item.cost)}</h4>
</div>
<img src="assets/promos/${util.slugify(item.name)}.png">
<h3>Hype Power: ${item.power}</h3>
`;

class SelectPromoView extends CardsList {
  constructor(player) {
    var selected;
    super({
      title: 'Start a Promo Campaign',
      background: '#f0f0f0',
      template: template,
      detailTemplate: detailTemplate,
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
      items: _.map(promos, i => _.extend({
        afford: player.company.cash >= i.cost
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
        class: item.afford ? '' : 'locked'
      }
    });
  }
}

export default SelectPromoView;
