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
  <h1><img src="assets/markets/${util.slugify(item.market)}.png"> ${item.name}</h1>
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
    this.assignedWorkers = _.filter(player.company.workers, w => w.task == task.id);
    this.assignedLocations = _.filter(player.company.locations, l => l.task == task.id);
    this.preassignedWorkers = this.assignedWorkers.slice(0);
    this.preassignedLocations = this.assignedLocations.slice(0);
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
            sel = player.company.workers[this.assignedWorkers_idx_map[idx]],
            view = this.subviews[idx];

        var $li = $(ev.target).closest('.card');
        if (_.contains(this.assignedWorkers, sel)) {
          this.assignedWorkers = _.without(this.assignedWorkers, sel);
          view.attrs.class = view.attrs.class.replace('selected', '');
        } else {
          // if already assigned, confirm
          if (sel.task) {
            var confirm = new Confirm(() => {
              this.assignedWorkers.push(sel);
              view.attrs.class += ' selected';
              this.updateAssignments(sel, view);
            });
            confirm.render('This employee is already assigned to a task. Employees can only work on one task at a time...do you want to change their assignment?', 'Re-assign', 'Nevermind');
          } else {
            this.assignedWorkers.push(sel);
            view.attrs.class += ' selected';
          }
        }
        this.updateAssignments(sel, view);
      },
      '.assign-locations > li': function(ev) {
        // idx + 1 b/c we skip the HQ
        var idx = this.itemIndex(ev.target) + 1,
            sel = player.company.locations[this.assignedLocations_idx_map[idx]],
            view = this.subviews[player.company.workers.length + idx - 1];

        var $li = $(ev.target).closest('.card');
        if (_.contains(this.assignedLocations, sel)) {
          this.assignedLocations = _.without(this.assignedLocations, sel);
          view.attrs.class = view.attrs.class.replace('selected', '');
        } else {
          if (sel.task) {
            var confirm = new Confirm(() => {
              this.assignedWorkers.push(sel);
              view.attrs.class += ' selected';
              this.updateAssignments(sel, view);
            });
            confirm.render('This location is already assigned to a task. Locations can only work on one task at a time...do you want to change its assignment?', 'Re-assign', 'Nevermind');
          } else {
            this.assignedLocations.push(sel);
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
          player.company.startTask(task, this.assignedWorkers, this.assignedLocations);
        } else {
          _.each(this.assignedWorkers, w => Task.assign(task, w));
          _.each(this.assignedLocations, l => Task.assign(task, l));
          _.each(_.difference(this.preassignedWorkers, this.assignedWorkers), w => Task.unassign(w));
          _.each(_.difference(this.preassignedLocations, this.assignedLocations), l => Task.unassign(l));
        }
        this.remove();
      }
    });

    this.sorted_workers = _.chain(player.company.workers).sortBy(this.sorter.bind(this)).value();
    this.sorted_locations = _.chain(player.company.locations).rest().sortBy(this.sorter.bind(this)).value();

    // compute a mapping of sorted indices to original indices
    this.assignedWorkers_idx_map = _.chain(player.company.workers).map((w, i) => ({idx: i, task: w.task})).sortBy(this.sorter.bind(this)).pluck('idx').value();
    this.assignedLocations_idx_map = _.chain(player.company.locations).rest().map((l, i) => ({idx: i, task: l.task})).sortBy(this.sorter.bind(this)).pluck('idx').value();
  }

  updateAssignments(sel, view) {
    this.el.find('.select').prop('disabled', this.assignedWorkers.length + this.assignedLocations.length == 0);
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

  sorter(w, i) {
    // 1. unassigned workers
    // 2. workers assigned to this task
    // 3. workers assigned to another task
    var idx = 0;
    if (w.task === this.task.id) {
      idx = 1;
    } else if (w.task) {
      idx = 2;
    }
    return (idx*10000) + i;
  }

  render() {
    var player = this.player,
        workers = _.map(this.sorted_workers, w => this.processItem(w, true)),
        locations = _.map(this.sorted_locations, l => this.processItem(l, false));
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

  processTask(task) {
    return _.extend({
      workers: this.assignedWorkers,
      locations: this.assignedLocations,
      hideActions: true,
      hideProgress: true,
      existing: this.existing
    }, task);
  }

  createListItem(item) {
    var template = item.worker ? templ.worker : locationTemplate,
        parent = item.worker ? '.assign-workers' : '.assign-locations',
        cls = '';
    if (util.contains(this.assignedWorkers, item) || util.contains(this.assignedLocations, item)) {
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
