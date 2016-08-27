import $ from 'jquery';
import _ from 'underscore';
import util from 'util';
import Task from 'game/Task';
import templ from '../Common';
import View from 'views/View';
import CardsList from 'views/CardsList';

const template = data => `
<ul class="cards assign-workers"></ul>
<ul class="cards assign-locations"></ul>
<div class="actions">
  <div class="task-assign-info">
    <h2>${data.task.obj.name}</h2>
    ${data.task.obj.cost ? `Requires an investment of ${util.formatCurrency(data.task.obj.cost)}` : ''}
  </div>
  <button class="select" disabled>Start</button>
</div>`;

const workerTemplate = item => `
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
  ${item.task ? `<div class="worker-task">Current task: ${item.task.obj.name}</div>` : ''}
</div>
`
const locationTemplate = item => `
<div class="title">
  <h1>${item.name}</h1>
  <h4 class="cash">${util.formatCurrencyAbbrev(item.cost)}</h4>
</div>
${templ.skills(item.skills)}
${item.effects.length > 0 ? templ.effects(item) : ''}
${item.task ? `<div class="worker-task">Current task: ${item.task.obj.name}</div>` : ''}`;


class AssignmentView extends CardsList {
  constructor(player, task) {
    super({
      title: 'Assign Task',
      template: template
    });
    this.task = task;
    this.player = player;
    this.workers = [];
    this.locations = [];
    this.registerHandlers({
      '.assign-workers > li': function(ev) {
        var idx = this.itemIndex(ev.target),
            sel = player.company.workers[idx],
            view = this.subviews[idx];

        var $li = $(ev.target).closest('.card');
        if (_.contains(this.workers, sel)) {
          this.workers = _.without(this.workers, sel);
          view.attrs.class = view.attrs.class.replace('selected', '');
        } else {
          this.workers.push(sel);
          view.attrs.class += ' selected';
        }
        this.el.find('.select').prop('disabled', this.workers.length + this.locations.length == 0);
        view.render(this.processItem(sel, true));
      },
      '.assign-locations > li': function(ev) {
        var idx = this.itemIndex(ev.target),
            sel = player.company.locations[idx],
            view = this.subviews[player.company.workers.length + idx];

        var $li = $(ev.target).closest('.card');
        if (_.contains(this.locations, sel)) {
          this.locations = _.without(this.locations, sel);
          view.attrs.class = view.attrs.class.replace('selected', '');
        } else {
          this.locations.push(sel);
          view.attrs.class += ' selected';
        }
        this.el.find('.select').prop('disabled', this.workers.length + this.locations.length == 0);
        view.render(this.processItem(sel, false));
      },
      '.select': function() {
        if (task.obj.cost) {
          player.company.pay(task.obj.cost, true);
        }
        player.company.startTask(task, this.workers, this.locations);
        this.remove();
      }
    });
  }

  processItem(item, worker) {
    return _.extend({
      worker: worker,
      task: this.player.company.task(worker.task)
    }, item);
  }

  showView(view) {
    var player = this.player;
    return function(e) {
      var v = new view(player);
      v.render();
    }
  }

  render() {
    var player = this.player,
        workers = _.map(player.company.workers, w => this.processItem(w, true)),
        locations = _.map(player.company.locations, l => this.processItem(l, false));
    super.render({
      task: task,
      items: workers.concat(locations)
    });
  }

  createListItem(item) {
    var template = item.worker ? workerTemplate : locationTemplate,
        parent = item.worker ? '.assign-workers' : '.assign-locations';
    return new View({
      tag: 'li',
      parent: parent,
      template: template,
      method: 'append'
    })
  }
}

export default AssignmentView;
