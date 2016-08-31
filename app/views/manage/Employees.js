import _ from 'underscore';
import util from 'util';
import templ from '../Common';
import CardsList from 'views/CardsList';

const template = data =>
  `${data.items.length > 0 ? '<ul class="cards"></ul>' : '<h1>No employees</h1>'}`;


class View extends CardsList {
  constructor(player) {
    super({
      title: 'Employees',
      template: template,
      detailTemplate: templ.worker,
      handlers: {
        '.fire': function(ev) {
          var idx = this.itemIndex(ev.target),
              sel = player.company.workers[idx];
          player.company.fireEmployee(sel);
          var subview = this.subviews[idx];
          this.subviews = _.without(this.subviews, subview);
          subview.remove();
        }
      }
    });
    this.player = player;
  }

  processItem(item) {
    var item = _.clone(item);
    item.task = this.player.company.task(item.task);
    return _.extend({
      fireable: true
    }, item);
  }

  render() {
    this.items = _.map(this.player.company.workers, this.processItem.bind(this));
    super.render({
      items: this.items
    });
  }

  update() {
    var self = this;
    _.each(_.zip(this.items, this.subviews), function(v) {
      var item = self.processItem(v[0]);
      if (!_.isEqual(v[0], item)) {
        var task = item.task ? `Assigned:<br>${item.task.obj.name}` : '';
        v[1].el.find('.worker-task').html(task);
      }
    });
  }
}

export default View;
