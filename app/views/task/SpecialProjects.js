import _ from 'underscore';
import util from 'util';
import templ from '../Common';
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
      ${templ.effects(item)}
      ${item.prereqs.length > 0 ? templ.prereqs(item) : ''}
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
        '.buy': function(ev) {
          var idx = this.itemIndex(ev.target),
              sel = specialProjects[idx];
          player.company.buySpecialProject(sel);
          this.subviews[idx].render(this.processItem(sel));
        }
      }
    });
    this.player = player;
  }

  render() {
    super.render({
      items: _.map(specialProjects, this.processItem.bind(this))
    });
  }

  processItem(item) {
    var player = this.player;
    return _.extend({
      owned: util.contains(player.company.specialProjects, item),
      unlocked: util.contains(player.unlocked.specialProjects, item),
      afford: player.company.cash >= item.cost,
      not_available: !player.company.specialProjectIsAvailable(item),
      prereqs: _.map(item.requiredProducts, function(p) {
        return {
          name: p,
          ok: util.containsByName(player.company.discoveredProducts, p)
        }
      })
    }, item);
  }
}

export default View;

