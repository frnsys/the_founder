import _ from 'underscore';
import util from 'util';
import templ from '../Common';
import Worker from 'game/Worker';
import CardsList from 'views/CardsList';

const template = data =>
  `${data.items.length > 0 ? '<ul class="cards"></ul>' : '<h1>No employees</h1>'}`;

class View extends CardsList {
  constructor(player, office) {
    super({
      title: 'Employees',
      template: template,
      detailTemplate: templ.worker,
      handlers: {
        '.fire': function(ev) {
          var idx = this.itemIndex(ev.target),
              sel = player.company.workers[idx];
          player.company.fireEmployee(sel);
          office.removeEmployee(sel);
          var subview = this.subviews[idx],
              item = this.items[idx];
          this.subviews = _.without(this.subviews, subview);
          this.items = _.without(this.items, item);
          subview.remove();
        },
        '.clone': function(ev) {
          var idx = this.itemIndex(ev.target),
              sel = player.company.workers[idx],
              clone = Worker.clone(player, sel);
          player.workers.push(clone);
          // hire clone for 0 salary
          player.company.hireEmployee(clone, 0);
          office.addEmployee(clone);

          var item = this.processItem(clone),
              subview = this.createListItem(item);
          this.items.push(item);
          this.subviews.push(subview);
          subview.attrs.class = 'card';
          subview.render(item);
        }
      }
    });
    this.player = player;
  }

  processItem(item) {
    var item = _.clone(item);
    item.task = this.player.company.task(item.task);
    return _.extend(item, {
      fireable: true,
      cloneable: this.player.specialEffects['Cloneable'],
      noAvailableSpace: this.player.company.remainingSpace == 0
    });
  }

  render() {
    this.items = _.map(this.player.company.workers, this.processItem.bind(this));
    super.render({
      items: this.items
    });
  }

  update() {
    var noAvailableSpace = this.player.company.remainingSpace == 0;
    var self = this;
    _.each(_.zip(this.items, this.subviews), function(v) {
      var item = self.processItem(v[0]);
      if (!_.isEqual(v[0], item)) {
        var task = item.task ? `Assigned:<br>${item.task.obj.name}` : '';
        v[1].el.find('.worker-task').html(task);
      }

      if (noAvailableSpace) {
        v[1].el.find('.clone').prop('disabled', true).text('Office is full');
      } else {
        v[1].el.find('.clone').prop('disabled', false).text('Clone');
      }
    });
  }
}

export default View;
