import _ from 'underscore';
import util from 'util';
import Effect from 'game/Effect';
import DetailList from 'views/DetailList';
import specialProjects from 'data/specialProjects.json';

const template = data => `
<div class="split-pane ${util.slugify(data.title)}">
  <ul class="list">
    ${data.items.map(i => `
      <li class="${i.owned ? 'owned' : ''}">${i.unlocked ? i.name : '???'}</li>
    `).join('')}
  </ul>
  <div class="detail"></div>
</div>
`

function detailTemplate(item) {
  if (item.unlocked) {
    var button;
    if (item.owned) {
      button = '<button disabled>Owned</button>';
    } else if (item.not_available) {
      button = '<button disabled>Missing prerequisites</button>';
    } else if (item.afford) {
      button = '<button class="buy">Buy</button>';
    } else {
      button = '<button disabled>Not enough cash</button>';
    }
    return `
      <img src="assets/specialProjects/${util.slugify(item.name)}.gif">
      <div class="title">
        <h1>${item.name}</h1>
        <h4 class="cash">${util.formatCurrencyAbbrev(item.cost)}</h4>
      </div>
      <p>${item.description}</p>
      <ul class="effects">
        ${item.effects.map(e => `
          <li>${Effect.toString(e)}</li>
        `).join('')}
      </ul>
      <h6>Prerequisites</h6>
      <ul class="required">
        ${item.prereqs.map(i => `
          <li class="${i.ok ? 'ok' : ''}">${i.name}</li>
        `).join('')}
      </ul>
      ${button}
    `;
  } else {
    return `
      <img src="assets/placeholder.gif">
      <div class="title">
        <h1>???</h1>
      </div>
      <p>This special project is yet to be discovered.</p>
    `;
  }
}


class View extends DetailList {
  constructor(player) {
    super({
      title: 'Special Projects',
      background: '#161616',
      template: template,
      dataSrc: specialProjects,
      detailTemplate: detailTemplate,
      handlers: {
        '.buy': function() {
          player.company.buySpecialProject(this.selected);
          this.renderDetailView(this.selected);
        }
      }
    });
    this.player = player;
  }

  render() {
    var player = this.player;
    player.onboard('specialProjects'); // TODO this should be handled by the manager not the view
    super.render({
      items: _.map(specialProjects, function(i) {
        return _.extend({
          owned: util.contains(player.company.specialProjects, i),
          unlocked: util.contains(player.unlocked.specialProjects, i)
        }, i);
      })
    });
  }

  renderDetailView(selected) {
    var player = this.player;
    this.detailView.render(_.extend({
      owned: util.contains(player.company.specialProjects, selected),
      unlocked: util.contains(player.unlocked.specialProjects, selected),
      afford: player.company.cash >= selected.cost,
      not_available: !player.company.specialProjectIsAvailable(selected),
      prereqs: _.map(selected.requiredProducts, function(p) {
        return {
          name: p,
          ok: util.containsByName(player.company.discoveredProducts, p)
        }
      })
    }, selected));
  }
}

export default View;

