import _ from 'underscore';
import util from 'util';
import Hiring from 'game/Hiring';
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
    list = 'No candidates found';
  }
  return `
    <div class="split-pane ${util.slugify(data.title)}">
      ${list}
      <div class="detail"></div>
    </div>`;
}

function button(item) {
  if (item.owned) {
    return `<button disabled>Hired</button>`;
  } else if (item.noAvailableSpace) {
    return `<button disabled>Not enough space</button>`;
  } else if (item.afford) {
    return `<button class="buy">Hire</button>`;
  } else {
    return `<button disabled>Not enough cash</button>`;
  }
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
</ul>
${button(item)}
`

class View extends DetailList {
  constructor(player, office, recruitment) {
    super({
      title: 'Candidates',
      background: 'rgb(45, 89, 214)',
      dataSrc: player.company.workers,
      template: template,
      detailTemplate: detailTemplate,
      handlers: {
        '.buy': function() {
          var salary = Hiring.salary(this.selected, player);
          if (player.company.pay(salary)) {
            // TODO need to remove from existing employer, if any
            this.selected.salary = salary;
            player.company.workers.push(this.selected);
            office.addEmployee(this.selected);
            this.renderDetailView(this.selected);
          }
        }
      }
    });
    this.player = player;
    this.recruitment = recruitment;
  }

  render() {
    var player = this.player;
    var candidates = Hiring.recruit(this.recruitment, player, player.company);
    player.onboard('hiring'); // TODO this should be handled by the manager not the view
    super.render({
      items: candidates
    });
  }

  renderDetailView(selected) {
    var player = this.player;
    this.detailView.render(_.extend({
      salary: Hiring.salary(selected, player),
      afford: player.company.cash >= salary,
      noAvailableSpace: player.company.remainingSpace == 0,
      economicPressure: player.economicStability - 1,
      wagePressure: player.wageMultiplier - 1,
      owned: util.contains(player.company.workers, selected)
    }, selected));
  }
}

export default View;

