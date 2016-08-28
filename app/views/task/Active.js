import $ from 'jquery';
import _ from 'underscore';
import util from 'util';
import Task from 'game/Task';
import Tasks from './Tasks';
import templ from '../Common';
import View from 'views/View';
import Confirm from 'views/Confirm';
import CardsList from 'views/CardsList';
import TaskAssignmentView from './Assignment';

const template = data => `
${data.items.length > 0 ? '<ul class="cards"></ul>' : '<h1 class="no-tasks">No active tasks. Wasting company time!</h1>'}`;

class ActiveView extends CardsList {
  constructor(player, task) {
    super({
      title: 'Tasks',
      template: template
    });
    this.player = player;
    this.registerHandlers({
      '.stop-task': function(ev) {
        var idx = this.itemIndex(ev.target),
            task = this.player.company.tasks[idx],
            view = this.subviews[idx],
            confirm = new Confirm(function() {
              Task.remove(task, player.company);
              view.remove();
            });
        confirm.render('Are you sure you want to cancel this task? You\'ll lose all progress!');
      },
      '.edit-task': function(ev) {
        var idx = this.itemIndex(ev.target),
            task = this.player.company.tasks[idx],
            view = new TaskAssignmentView(player, task);
        this.remove();
        view.render();
      }
    });
  }

  processItem(item) {
    return _.extend({
      workers: _.filter(this.player.company.workers, w => w.task == item.id),
      locations: _.filter(this.player.company.locations, l => l.task == item.id)
    }, item);
  }

  render() {
    super.render({
      items: _.map(this.player.company.tasks, this.processItem.bind(this))
    });
  }

  update() {
    _.each(_.zip(this.player.company.tasks, this.subviews), function(v) {
      var t = v[0],
          sv = v[1];
      if (_.contains([Task.Type.Promo, Task.Type.Research, Task.Type.Lobby], t.type)) {
        sv.el.find('.task-progress-inner').css('width', `${(t.progress/t.requiredProgress)*100}%`);
      } else if (t.type === Task.Type.Product) {
        sv.el.find('.task-progress-inner').css('width', `${(t.progress/t.requiredProgress)*100}%`);
        sv.el.find('.design-stat').text(Math.floor(t.obj.design));
        sv.el.find('.marketing-stat').text(Math.floor(t.obj.marketing));
        sv.el.find('.engineering-stat').text(Math.floor(t.obj.engineering));
      } else if (t.type === Task.Type.SpecialProject) {
        sv.el.find('.design-progress').css('width', `${(t.obj.design/t.obj.required.design)*100}%`);
        sv.el.find('.marketing-progress').css('width', `${(t.obj.marketing/t.obj.required.marketing)*100}%`);
        sv.el.find('.engineering-progress').css('width', `${(t.obj.engineering/t.obj.required.engineering)*100}%`);
      }
    });
  }

  createListItem(item) {
    var template = Tasks.Basic,
        attrs = {
          class: `task-${util.slugify(util.enumName(item.type, Task.Type))}`
        };

    switch(item.type) {
        case Task.Type.Promo:
          item.img = `assets/promos/${util.slugify(item.obj.name)}.png`;
          break;
        case Task.Type.Research:
          item.img = `assets/techs/${util.slugify(item.obj.name)}.png`;
          break;
        case Task.Type.Lobby:
          attrs.style = `background-image:url(assets/lobbying/${util.slugify(item.obj.name)}.jpg)`
          break;
        case Task.Type.Product:
          template = Tasks.Product;
          break;
        case Task.Type.SpecialProject:
          template = Tasks.SpecialProject;
          break;
    }

    return new View({
      tag: 'li',
      parent: '.cards',
      template: template,
      method: 'append',
      attrs: attrs
    })
  }
}

export default ActiveView;
