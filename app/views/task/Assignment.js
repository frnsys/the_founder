import $ from 'jquery';
import _ from 'underscore';
import util from 'util';
import Task from 'game/Task';
import Tasks from './Tasks';
import templ from '../Common';
import View from 'views/View';
import CardsList from 'views/CardsList';
import Confirm from 'views/alerts/Confirm';


function button(task) {
  if (!task.existing) {
    return `<button class="select" disabled>Start${task.obj.cost ? ` for ${util.formatCurrency(task.obj.cost)}` : ''}</button>`
  } else {
    return `<button class="select">Confirm</button>`
  }
}

const template = data => `
<div class="tasks the-task"><ul class="cards"></ul></div>
<ul class="tabs">
  <li class="selected" data-tab="assign-workers">Employees</li>
  <li data-tab="assign-locations">Locations</li>
</ul>
<ul class="cards assign-workers tab-page selected"></ul>
<ul class="cards assign-locations tab-page"></ul>
<div class="actions">
  ${button(data.task)}
</div>`;


const locationTemplate = item => `
<div class="title">
  <h1><img src="/assets/markets/${util.slugify(item.market)}.png"> ${item.name}</h1>
</div>
${templ.skills(item.skills)}
${item.task ? `<div class="assigned-task location-task">Assigned: ${item.task.obj.name}</div>` : ''}`;


class AssignmentView extends CardsList {
  constructor(player, task) {
    super({
      title: 'Assign Task',
      template: template
    });
    this.existing = _.contains(_.pluck(player.company.tasks, 'id'), task.id);
    this.task = task;
    this.player = player;
    this.workers = _.filter(player.company.workers, w => w.task == task.id);
    this.locations = _.filter(player.company.locations, l => l.task == task.id);
    this.preassignedWorkers = this.workers.slice(0);
    this.preassignedLocations = this.locations.slice(0);
    this.registerHandlers({
      '.tabs li': function(ev) {
        var target = $(ev.target).data('tab');
        $('.tabs .selected').removeClass('selected');
        $(ev.target).addClass('selected');
        $('.tab-page').hide();
        $(`.tab-page.${target}`).show();
      },
      '.assign-workers > li': function(ev) {
        var idx = this.itemIndex(ev.target),
            sel = player.company.workers[idx],
            view = this.subviews[idx];

        var $li = $(ev.target).closest('.card');
        if (_.contains(this.workers, sel)) {
          this.workers = _.without(this.workers, sel);
          view.attrs.class = view.attrs.class.replace('selected', '');
        } else {
          // if already assigned, confirm
          if (sel.task) {
            var confirm = new Confirm(() => {
              this.workers.push(sel);
              view.attrs.class += ' selected';
              this.updateAssignments(sel, view);
            });
            confirm.render('This employee is already assigned to a task. Employees can only work on one task at a time...do you want to change their assignment?', 'Re-assign', 'Nevermind');
          } else {
            this.workers.push(sel);
            view.attrs.class += ' selected';
          }
        }
        this.updateAssignments(sel, view);
      },
      '.assign-locations > li': function(ev) {
        // idx + 1 b/c we skip the HQ
        var idx = this.itemIndex(ev.target) + 1,
            sel = player.company.locations[idx],
            view = this.subviews[player.company.workers.length + idx - 1];

        var $li = $(ev.target).closest('.card');
        if (_.contains(this.locations, sel)) {
          this.locations = _.without(this.locations, sel);
          view.attrs.class = view.attrs.class.replace('selected', '');
        } else {
          if (sel.task) {
            var confirm = new Confirm(() => {
              this.workers.push(sel);
              view.attrs.class += ' selected';
              this.updateAssignments(sel, view);
            });
            confirm.render('This location is already assigned to a task. Locations can only work on one task at a time...do you want to change its assignment?', 'Re-assign', 'Nevermind');
          } else {
            this.locations.push(sel);
            view.attrs.class += ' selected';
          }
        }
        this.updateAssignments(sel, view);
      },
      '.select': function() {
        if (!this.existing) {
          if (task.obj.cost) {
            player.company.pay(task.obj.cost, true);
          }
          player.company.startTask(task, this.workers, this.locations);
        } else {
          _.each(this.workers, w => Task.assign(task, w));
          _.each(this.locations, l => Task.assign(task, l));
          _.each(_.difference(this.preassignedWorkers, this.workers), w => Task.unassign(w));
          _.each(_.difference(this.preassignedLocations, this.locations), l => Task.unassign(l));
        }
        this.remove();
      }
    });
  }

  updateAssignments(sel, view) {
    this.el.find('.select').prop('disabled', this.workers.length + this.locations.length == 0);
    view.render(this.processItem(sel, true));
    this.el.find('.task-assignees, .task-no-assignees').replaceWith(Tasks.Assignees(this.processTask(this.task)));
  }

  processItem(item, worker) {
    var item = _.clone(item);
    item.task = this.player.company.task(item.task);
    return _.extend({
      worker: worker
    }, item);
  }

  render() {
    var player = this.player,
        workers = _.map(player.company.workers, w => this.processItem(w, true)),
        locations = _.map(_.rest(player.company.locations), l => this.processItem(l, false));
    super.render({
      task: this.processTask(this.task),
      items: workers.concat(locations)
    });

    var task = this.task,
        template = Tasks.Basic,
        attrs = {
          class: `task-${util.slugify(util.enumName(task.type, Task.Type))}`
        };
    switch(task.type) {
        case Task.Type.Promo:
          task.img = `assets/promos/${util.slugify(task.obj.name)}.png`;
          break;
        case Task.Type.Research:
          task.img = `assets/techs/${util.slugify(task.obj.name)}.png`;
          break;
        case Task.Type.Lobby:
          attrs.style = `background-image:url(assets/lobbying/${util.slugify(task.obj.name)}.jpg)`
          break;
        case Task.Type.Product:
          template = Tasks.Product;
          break;
        case Task.Type.SpecialProject:
          template = Tasks.SpecialProject;
          break;
        case Task.Type.Event:
          template = Tasks.Event;
          break;
    }
    this.taskView = new View({
      tag: 'li',
      parent: '.assign_task .tasks .cards',
      template: template,
      attrs: attrs
    });
    this.taskView.render(this.processTask(task));
  }

  update() {
    var self = this,
        workers = _.map(this.player.company.workers, w => this.processItem(w, true)),
        locations = _.map(_.rest(this.player.company.locations), l => this.processItem(l, false));
    _.each(_.zip(workers.concat(locations), this.subviews), function(v) {
      var item = v[0],
          task = '';
      if (item.task) {
        if (item.worker) {
          task = `Assigned:<br>${item.task.obj.name}`;
        } else {
          task = `Assigned: ${item.task.obj.name}`;
        }
      }
      v[1].el.find('.assigned-task').html(task);
    });
  }

  processTask(task) {
    return _.extend({
      workers: this.workers,
      locations: this.locations,
      hideActions: true,
      hideProgress: true,
      existing: this.existing
    }, task);
  }

  createListItem(item) {
    var template = item.worker ? templ.worker : locationTemplate,
        parent = item.worker ? '.assign-workers' : '.assign-locations',
        cls = '';
    if (util.contains(this.workers, item) || util.contains(this.locations, item)) {
      cls = 'selected';
    }
    return new View({
      tag: 'li',
      parent: parent,
      template: template,
      method: 'append',
      attrs: {
        class: cls
      }
    })
  }
}

export default AssignmentView;
