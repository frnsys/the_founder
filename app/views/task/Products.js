import $ from 'jquery';
import _ from 'underscore';
import util from 'util';
import CardsList from 'views/CardsList';
import TaskAssignmentView from './Assignment';

const detailTemplate = item => `
<div class="title">
  <h1>${item.name}</h1>
</div>
<img src="assets/productTypes/${util.slugify(item.name)}.gif">
`;

const template = data => `
<ul class="cards"></ul>
<div class="actions">
  <button class="select" disabled>Confirm</button>
</div>`;

class View extends CardsList {
  constructor(player) {
    var selected = [];
    super({
      title: 'Start a Product',
      template: template,
      detailTemplate: detailTemplate,
      handlers: {
        '.select': function() {
          if (selected.length == 2) {
            var task = player.company.startProduct(selected);
            if (task) {
              var view = new TaskAssignmentView(player, task);
              this.remove();
              view.render();
            }
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
