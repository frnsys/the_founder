import _ from 'underscore';
import util from 'util';
import CardsList from 'views/CardsList';
import verticals from 'data/verticals.json';


function button(item) {
  if (item.owned) {
    return '<button disabled class="owned">Owned</button>';
  } else if (item.afford) {
    return '<button class="buy">Expand to this vertical</button>';
  } else {
    return '<button disabled>Not enough cash</button>';
  }
}

const detailTemplate = item => `
  <div class="title">
    <h1>${item.name}</h1>
    <h4 class="cash">${util.formatCurrencyAbbrev(item.cost)}</h4>
  </div>
  <img src="assets/verticals/${util.slugify(item.name)}.gif">
  <p>${item.description}</p>
  ${button(item)}
`

class View extends CardsList {
  constructor(player) {
    super({
      title: 'Verticals',
      detailTemplate: detailTemplate,
      handlers: {
        '.buy': function() {
          player.company.buyVertical(this.selected);
          this.renderDetailView(this.selected);
        }
      }
    });
    this.player = player;
  }

  render() {
    var player = this.player;
    super.render({
      items: _.map(verticals, i => _.extend({
        owned: util.contains(player.company.verticals, i),
        afford: player.company.cash >= i.cost
      }, i))
    });
  }
}

export default View;
