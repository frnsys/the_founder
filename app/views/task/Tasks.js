import _ from 'underscore';
import util from 'util';
import Task from 'game/Task';

const SHOW_N_ASSIGNEES = 5;
function assignees(item) {
  var n_workers = item.workers.length,
      n_locations = item.locations.length;
  if (n_workers > 0 || n_locations > 0) {
    var take_workers = Math.min(n_workers, SHOW_N_ASSIGNEES),
        take_locations = Math.max(0, SHOW_N_ASSIGNEES - n_workers),
        extra_assignees = (n_workers - take_workers) + (n_locations - take_locations),
        extras = _.rest(item.workers, take_workers).concat(_.rest(item.locations, take_locations));
    return `<ul class="task-assignees">
      ${_.first(item.workers, take_workers).map(i => `
        <li data-tip="${i.name}"><img src="/assets/workers/pngs/${i.avatar}.png"></li>
      `).join('')}
      ${_.first(item.locations, take_locations).map(i => `
        <li data-tip="${i.name}"><img src="/assets/markets/${util.slugify(i.market)}.png"></li>
      `).join('')}
      ${extra_assignees > 0 ? `<span class="task-extra-assignees" data-tip="${extras.map(i => i.name).join('<br>')}"> + ${extra_assignees} more</span>` : ''}
    </ul>`;
  } else {
    return '<h2 class="task-no-assignees">No one assigned</h2>';
  }
}

function actions(item) {
  if (!item.hideActions) {
    return `
      <ul class="task-actions">
        <li class="edit-task">Edit</li>
        <li class="stop-task">Stop</li>
      </ul>`;
  }
  return '';
}

function progressBar(item) {
  if (!item.hideProgress) {
    return `<div class="task-progress-inner" style="width:${(item.progress/item.requiredProgress)*100}%"></div>`;
  }
  return '';
}

function specialProjectProgress(item) {
  if (!item.hideProgress) {
    return `
    <ul class="task-progresses">
    <li data-tip="Design">
      <img src="/assets/company/design.png">
      <div class="task-progress-outer">
        <div class="task-progress-inner design-progress" style="width:${(item.obj.design/item.obj.required.design)*100}%"></div>
      </div>
    </li>
    <li data-tip="Marketing">
      <img src="/assets/company/marketing.png">
      <div class="task-progress-outer">
        <div class="task-progress-inner marketing-progress" style="width:${(item.obj.marketing/item.obj.required.marketing)*100}%"></div>
      </div>
    </li>
    <li data-tip="Engineering">
      <img src="/assets/company/engineering.png">
      <div class="task-progress-outer">
        <div class="task-progress-inner engineering-progress" style="width:${(item.obj.engineering/item.obj.required.engineering)*100}%"></div>
      </div>
    </li>
  </ul>`;
  }
  return '';
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
  ${progressBar(item)}
  ${actions(item)}
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
      <li data-tip="Design"><img src="/assets/company/design.png"> <span class="design-stat">${Math.floor(item.obj.design)}</span></li>
      <li data-tip="Marketing"><img src="/assets/company/marketing.png"> <span class="marketing-stat">${Math.floor(item.obj.marketing)}</span></li>
      <li data-tip="Engineering"><img src="/assets/company/engineering.png"> <span class="engineering-stat">${Math.floor(item.obj.engineering)}</span></li>
    </ul>
  </div>
  ${progressBar(item)}
  ${actions(item)}
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
  ${specialProjectProgress(item)}
  ${actions(item)}
`;

export default {
  Basic: basicTemplate,
  Product: productTemplate,
  SpecialProject: specialProjectTemplate,
  Assignees: assignees
};
