import _ from 'underscore';
import util from 'util';
import Effect from 'game/Effect';
import CardsList from 'views/CardsList';
import specialProjects from 'data/specialProjects.json';

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
      <div class="title">
        <h1>${item.name}</h1>
        <h4 class="cash">${util.formatCurrencyAbbrev(item.cost)}</h4>
      </div>
      <img src="assets/specialProjects/${util.slugify(item.name)}.gif">
      <p>${item.description}</p>
      <ul class="effects">
        ${item.effects.map(e => `
          <li>${Effect.toString(e)}</li>
        `).join('')}
      </ul>
      <div class="prereqs">Requires:
        ${item.prereqs.map(i => `
          <span class="prereq ${i.ok ? 'ok' : ''}">${i.name.replace('.','+')}</span>
        `).join('')}</div>
      ${button}
    `;
  } else {
    return `
      <div class="title">
        <h1>???</h1>
      </div>
      <img src="assets/placeholder.gif">
      <p class="undiscovered">This special project is yet to be discovered.</p>
    `;
  }
}


class View extends CardsList {
  constructor(player) {
    super({
      title: 'Special Projects',
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
    super.render({
      items: _.map(specialProjects, function(i) {
        return _.extend({
          owned: util.contains(player.company.specialProjects, i),
          unlocked: util.contains(player.unlocked.specialProjects, i),
          afford: player.company.cash >= i.cost,
          not_available: !player.company.specialProjectIsAvailable(i),
          prereqs: _.map(i.requiredProducts, function(p) {
            return {
              name: p,
              ok: util.containsByName(player.company.discoveredProducts, p)
            }
          })
        }, i);
      })
    });
  }
}

export default View;

