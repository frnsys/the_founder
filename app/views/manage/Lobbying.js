import _ from 'underscore';
import util from 'util';
import templ from './Common';
import View from 'views/View';
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
  ${templ.effects(item)}
  ${button(item)}
`

class LobbyingView extends CardsList {
  constructor(player) {
    super({
      title: 'Lobbying',
      detailTemplate: detailTemplate,
      handlers: {
        '.buy': function(ev) {
          var idx = this.itemIndex(ev.target),
              sel = lobbies[idx];
          player.company.buyLobby(sel);
          this.subviews[idx].render(this.processItem(sel));
        }
      }
    });
    this.player = player;
  }

  render() {
    super.render({
      items: _.map(lobbies, this.processItem.bind(this))
    });
  }

  processItem(item) {
    var player = this.player;
    return _.extend({
      owned: util.contains(player.company.lobbies, item),
      afford: player.company.cash >= item.cost
    }, item);
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
