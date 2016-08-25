import _ from 'underscore';
import util from 'util';
import View from 'views/View';
import Effect from 'game/Effect';
import CardsList from 'views/CardsList';
import lobbies from 'data/lobbies.json';


function button(item) {
  if (item.owned) {
    return '<button disabled class="owned">Owned</button>';
  } else if (item.afford) {
    return '<button class="buy">Buy</button>';
  } else {
    return '<button disabled>Not enough cash</button>';
  }
}

const detailTemplate = item => `
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
  ${button(item)}
`

class LobbyingView extends CardsList {
  constructor(player) {
    super({
      title: 'Lobbying',
      detailTemplate: detailTemplate,
      handlers: {
        '.buy': function() {
          player.company.buyLobby(this.selected);
          this.renderDetailView(this.selected);
        }
      }
    });
    this.player = player;
  }

  render() {
    var player = this.player;
    super.render({
      items: _.map(lobbies, i => _.extend({
        owned: util.contains(player.company.lobbies, i),
        afford: player.company.cash >= i.cost
      }, i))
    });
  }

  createListItem(item) {
    var img = `assets/lobbying/${util.slugify(item.name)}.jpg`;
    return new View({
      tag: 'li',
      parent: this.el.find('ul'),
      template: this.detailTemplate,
      method: 'append',
      attrs: {
        style: `background-image:url(${img})`
      }
    });
  }
}

export default LobbyingView;
