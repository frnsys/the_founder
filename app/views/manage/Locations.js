import _ from 'underscore';
import util from 'util';
import Effect from 'game/Effect';
import DetailList from 'views/DetailList';
import locations from 'data/locations.json';

function button(item) {
  if (item.owned) {
    return '<button disabled>Owned</button>';
  } else if (item.afford) {
    return '<button class="buy">Expand here</button>';
  } else {
    return '<button disabled>Not enough cash</button>';
  }
}

const detailTemplate = item => `
<img src="assets/markets/${util.slugify(item.market)}.png">
<div class="title">
  <h1>${item.name}</h1>
  <h4 class="cash">${util.formatCurrencyAbbrev(item.cost)}</h4>
  <h5 class="subtitle">The ${item.market} market</h5>
</div>
<ul class="effects">
  ${item.effects.map(e => `
    <li>${Effect.toString(e)}</li>
  `).join('')}
</ul>
${button(item)}
`

class View extends DetailList {
  constructor(player) {
    super({
      title: 'Locations',
      background: '#5e9dff',
      dataSrc: locations,
      detailTemplate: detailTemplate,
      handlers: {
        '.buy': function() {
          player.company.buyLocation(this.selected);
          this.renderDetailView(this.selected);
        }
      }
    });
    this.player = player;
  }

  render() {
    var player = this.player;
    super.render({
      items: _.map(locations, function(i) {
        return _.extend({
          owned: util.contains(player.company.locations, i)
        }, i);
      })
    });
  }

  renderDetailView(selected) {
    this.detailView.render(_.extend({
      owned: util.contains(this.player.company.locations, selected),
      afford: this.player.company.cash >= selected.cost
    }, selected));
  }
}

export default View;
