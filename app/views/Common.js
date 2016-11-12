import _ from 'underscore';
import util from 'util';
import Effect from 'game/Effect';
import Worker from 'game/Worker';

const effectsTemplate = function(item) {
  if (item.effects.length > 0) {
    return `<ul class="effects">
      ${item.effects.map(e => `
        <li>${Effect.toString(e)}</li>
      `).join('')}
    </ul>`;
  } else {
    return '';
  }
}

const attributesTemplate = item => `
  <ul class="worker-attributes">
    ${item.attributes.map(i => `
      <li data-tip="<ul>${Worker.attributeToStrings(i).map(s => `<li>${s}</li>`).join('')}</ul>">${i}</li>
    `).join('')}
  </ul>
`;

const skillsTemplate = item => `
  <ul class="worker-stats">
    <li data-tip="Productivity"><img src="assets/company/productivity.png"> ${util.abbreviateNumber(Math.round(item.productivity), 0)}</li>
    <li data-tip="Design"><img src="assets/company/design.png"> ${util.abbreviateNumber(Math.round(item.design), 0)}</li>
    <li data-tip="Marketing"><img src="assets/company/marketing.png"> ${util.abbreviateNumber(Math.round(item.marketing), 0)}</li>
    <li data-tip="Engineering"><img src="assets/company/engineering.png"> ${util.abbreviateNumber(Math.round(item.engineering), 0)}</li>
    <li data-tip="Happiness"><img src="assets/company/happiness.png"> ${util.abbreviateNumber(Math.round(item.happiness), 0)}</li>
  </ul>
`;

const prereqsTemplate = (item, requires) => `
  <div class="prereqs">${requires || 'Requires'}:
    ${item.prereqs.map(i => `
      <span class="prereq ${i.ok ? 'ok' : ''}">${i.name.replace('.','+')}</span>
    `).join('')}</div>
`;

const workerTemplate = item => `
<div class="worker-avatar">
  <img src="assets/workers/gifs/${item.avatar}.gif">
  <div class="assigned-task worker-task">${item.task ? `Assigned:<br>${item.task.obj.name}` : ''}</div>
</div>
<div class="worker-info">
  <div class="worker-title">
    <h1>${item.name}</h1>
    <h3 class="subtitle">${item.title}, <span class="cash">${util.formatCurrencyAbbrev(item.salary)}/yr</span></h3>
  </div>
  <div class="worker-body">
    ${skillsTemplate(item)}
    ${item.attributes.length > 0 ? attributesTemplate(item) : ''}
  </div>
  <div class="worker-actions">
    ${item.fireable ? `<button class="fire">${item.robot ? 'Decommission' : 'Fire'}</button>` : ''}
    ${item.cloneable && !item.robot ? `<button class="clone" ${item.noAvailableSpace ? 'disabled' : ''}>${item.noAvailableSpace ? 'Office is full' : 'Clone'}</button>` : ''}
  </div>
</div>
`

const expertiseTemplate = item => `
<div class="expertise-points">
  <h3>Expertise:</h3>
  <ul>
    ${_.times(item.expertise, i => `
      <li class="expertise-point filled"></li>
    `).join('')}
    ${_.times(10-item.expertise, i => `
      <li class="expertise-point"></li>
    `).join('')}
  </ul>
</div>
`;

export default {
  effects: effectsTemplate,
  attributes: attributesTemplate,
  skills: skillsTemplate,
  prereqs: prereqsTemplate,
  worker: workerTemplate,
  expertise: expertiseTemplate
};
