import _ from 'underscore';
import util from 'util';
import templ from '../Common';
import CardsList from 'views/CardsList';

const template = data =>
  `${data.items.length > 0 ? '<ul class="cards"></ul>' : 'No employees'}`;

const detailTemplate = item => `
<div class="worker-avatar">
  <img src="/assets/workers/gifs/${item.avatar}.gif">
</div>
<div class="worker-info">
  <div class="worker-title">
    <h1>${item.name}</h1>
    <h3 class="subtitle">${item.title}, <span class="cash">${util.formatCurrencyAbbrev(item.salary)}/yr</span></h3>
  </div>
  <div class="worker-body">
    ${templ.skills(item)}
    ${item.attributes.length > 0 ? templ.attributes(item) : ''}
  </div>
  <button class="fire">Fire</button>
</div>
`

class View extends CardsList {
  constructor(player) {
    super({
      title: 'Employees',
      template: template,
      detailTemplate: detailTemplate,
      handlers: {
        '.fire': function(ev) {
          var idx = this.itemIndex(ev.target),
              sel = player.company.workers[idx];
          sel.salary = 0;
          player.company.workers = _.without(player.company.workers, sel);
          var subview = this.subviews[idx];
          this.subviews = _.without(this.subviews, subview);
          subview.remove();
        }
      }
    });
    this.player = player;
  }

  render() {
    var player = this.player;
    super.render({
      items: _.map(player.company.workers, w => _.extend({
        task: player.company.task(w.task)
      }, w))
    });
  }
}

export default View;
