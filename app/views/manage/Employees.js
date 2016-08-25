import _ from 'underscore';
import util from 'util';
import Worker from 'game/Worker';
import CardsList from 'views/CardsList';

const template = data =>
  `${data.items.length > 0 ? '<ul class="cards"></ul>' : 'No employees'}`;

const attributeTemplate = item => `
  <ul class="worker-attributes">
    ${item.attributes.map(i => `
      <li data-tip="<ul>${Worker.attributeToStrings(i).map(s => `<li>${s}</li>`).join('')}</ul>">${i}</li>
    `).join('')}
  </ul>
`;

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
    <ul class="worker-stats">
      <li data-tip="Productivity"><img src="/assets/company/productivity.png"> ${util.abbreviateNumber(Math.round(item.productivity), 0)}</li>
      <li data-tip="Design"><img src="/assets/company/design.png"> ${util.abbreviateNumber(Math.round(item.design), 0)}</li>
      <li data-tip="Marketing"><img src="/assets/company/marketing.png"> ${util.abbreviateNumber(Math.round(item.marketing), 0)}</li>
      <li data-tip="Engineering"><img src="/assets/company/engineering.png"> ${util.abbreviateNumber(Math.round(item.engineering), 0)}</li>
      <li data-tip="Happiness"><img src="/assets/company/happiness.png"> ${util.abbreviateNumber(Math.round(item.happiness), 0)}</li>
    </ul>
    ${item.attributes.length > 0 ? attributeTemplate(item) : ''}
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
        '.fire': function() {
          this.selected.salary = 0;
          player.company.workers = _.without(player.company.workers, this.selected);
          this.renderDetailView(this.selected);
          // TODO re-render page or something
        }
      }
    });
    this.player = player;
  }

  render() {
    var player = this.player;
    super.render({
      items: player.company.workers
    });
  }
}

export default View;
