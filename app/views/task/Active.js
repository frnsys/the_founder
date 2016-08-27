import $ from 'jquery';
import _ from 'underscore';
import util from 'util';
import Task from 'game/Task';
import templ from '../Common';
import View from 'views/View';
import Confirm from 'views/Confirm';
import CardsList from 'views/CardsList';

const template = data => `
${data.items.length > 0 ? '<ul class="cards"></ul>' : '<h1 class="no-tasks">No active tasks. Wasting company time!</h1>'}`;

const SHOW_N_ASSIGNEES = 5;
const assignees = function(item) {
  var n_workers = item.workers.length,
      n_locations = item.locations.length;
  if (n_workers > 0 || n_locations > 0) {
    var take_workers = Math.min(n_workers, SHOW_N_ASSIGNEES),
        take_locations = Math.max(0, SHOW_N_ASSIGNEES - n_workers),
        extra_assignees = (n_workers - take_workers) + (n_locations - take_locations);
    return `<ul class="task-assignees">
      ${_.first(item.workers, take_workers).map(i => `
        <li data-tip="${i.name}"><img src="/assets/workers/pngs/${i.avatar}.png"></li>
      `).join('')}
      ${_.first(item.locations, take_locations).map(i => `
        <li data-tip="${i.name}"><img src="/assets/markets/${util.slugify(i.market)}.png"></li>
      `).join('')}
      ${extra_assignees > 0 ? `<span class="task-extra-assignees"> + ${extra_assignees} more</span>` : ''}
    </ul>`;
  } else {
    return '<h2 class="task-no-assignees">No one assigned</h2>';
  }
}

const basicTemplate = item => `
  <div class="title">
    <h3 class="subtitle">${util.enumName(item.type, Task.Type)}</h3>
    <h1>${item.obj.name}</h1>
    ${assignees(item)}
  </div>
  <div class="task-body">
    ${item.img ? `<img src="${item.img}">` : ''}
    <div class="task-info">
      <p>${item.obj.description}</p>
      ${item.obj.effects && item.obj.effects.length > 0 ? `${templ.effects(item.obj)}` : ''}
    </div>
  </div>
  <div class="task-progress-outer">
    <div class="task-progress-inner" style="width:${(item.progress/item.requiredProgress)*100}%"></div>
  </div>
  <ul class="task-actions">
    <li class="edit-task">Edit</li>
    <li class="stop-task">Stop</li>
  </ul>
`;

const productTemplate = item => `
  <div class="title">
    <h3 class="subtitle">${util.enumName(item.type, Task.Type)}</h3>
    <h1>${item.obj.combo}</h1>
    ${assignees(item)}
  </div>
  <figure>
    ${item.obj.productTypes.map(pt => `
      <img src="assets/productTypes/${util.slugify(pt)}.gif">
    `).join('')}
  </figure>
  <div class="task-body">
    <ul class="stats">
      <li data-tip="Design"><img src="/assets/company/design.png"> ${Math.floor(item.obj.design)}</li>
      <li data-tip="Marketing"><img src="/assets/company/marketing.png"> ${Math.floor(item.obj.marketing)}</li>
      <li data-tip="Engineering"><img src="/assets/company/engineering.png"> ${Math.floor(item.obj.engineering)}</li>
    </ul>
  </div>
  <div class="task-progress-outer">
    <div class="task-progress-inner" style="width:${(item.progress/item.requiredProgress)*100}%"></div>
  </div>
  <ul class="task-actions">
    <li class="edit-task">Edit</li>
    <li class="stop-task">Stop</li>
  </ul>
`;

const specialProjectTemplate = item => `
  <div class="title">
    <h3 class="subtitle">${util.enumName(item.type, Task.Type)}</h3>
    <h1>${item.obj.name}</h1>
    ${assignees(item)}
  </div>
  <div class="task-body">
    <img src="assets/specialProjects/${util.slugify(item.obj.name)}.gif">
    <div class="task-info">
      <p>${item.obj.description}</p>
      ${templ.effects(item.obj)}
    </div>
  </div>
  <ul class="task-progresses">
    <li data-tip="Design">
      <img src="/assets/company/design.png">
      <div class="task-progress-outer">
        <div class="task-progress-inner" style="width:${(item.obj.design/item.obj.required.design)*100}%"></div>
      </div>
    </li>
    <li data-tip="Marketing">
      <img src="/assets/company/marketing.png">
      <div class="task-progress-outer">
        <div class="task-progress-inner" style="width:${(item.obj.marketing/item.obj.required.marketing)*100}%"></div>
      </div>
    </li>
    <li data-tip="Engineering">
      <img src="/assets/company/engineering.png">
      <div class="task-progress-outer">
        <div class="task-progress-inner" style="width:${(item.obj.engineering/item.obj.required.engineering)*100}%"></div>
      </div>
    </li>
  </ul>
  <ul class="task-actions">
    <li class="edit-task">Edit</li>
    <li class="stop-task">Stop</li>
  </ul>
`;


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
      }
    });
  }

  processItem(item) {
    console.log(item);
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

  createListItem(item) {
    var template = basicTemplate,
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
          template = productTemplate;
          break;
        case Task.Type.SpecialProject:
          template = specialProjectTemplate;
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
