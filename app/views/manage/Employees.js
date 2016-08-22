import _ from 'underscore';
import util from 'util';
import DetailList from 'views/DetailList';

const template = function(data) {
  var list;
  if (data.items) {
    list = `<ul class="list">
      ${data.items.map(i => `
        <li>${i.name}</li>
      `).join('')}
    </ul>`;
  } else {
    list = 'No employees';
  }
  return `
    <div class="split-pane ${util.slugify(data.title)}">
      ${list}
      <div class="detail"></div>
    </div>`;
}

const detailTemplate = item => `
<img src="/assets/workers/gifs/${item.avatar}.gif">
<div class="title">
  <h1>${item.name}</h1>
  <h4 class="cash">${util.formatCurrencyAbbrev(item.salary)}/yr</h4>
</div>
<p>${item.title}</p>
<ul>
  <li>Productivity: ${item.productivity}</li>
  <li>Design: ${item.design}</li>
  <li>Engineering: ${item.engineering}</li>
  <li>Marketing: ${item.marketing}</li>
  <li>Happiness: ${item.happiness}</li>
</ul>
<button class="fire">Fire</button>
`

class View extends DetailList {
  constructor(player) {
    super({
      title: 'Employees',
      background: '#fb6754',
      dataSrc: player.company.workers,
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
    player.onboard('employees'); // TODO this should be handled by the manager not the view
    super.render({
      items: player.company.workers
    });
  }

  renderDetailView(selected) {
    this.detailView.render(selected);
  }
}

export default View;
