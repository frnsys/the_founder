import _ from 'underscore';
import util from 'util';
import templ from '../Common';
import View from 'views/View';
import CardsList from 'views/CardsList';
import TaskAssignmentView from './Assignment';
import lobbies from 'data/lobbies.json';


function button(item) {
  if (item.in_progress) {
    return '<button disabled>In Progress</button>';
  } else if (item.owned) {
    return '<button disabled class="owned">Completed</button>';
  } else if (item.afford) {
    return '<button class="buy">Start</button>';
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
              sel = lobbies[idx],
              task = player.company.startLobby(sel);
          if (task) {
            var view = new TaskAssignmentView(player, task);
            this.remove();
            view.render();
          }
        }
      }
    });
    this.player = player;
  }

  render() {
    this.items = _.map(lobbies, l => {
      var item = this.processItem.bind(l);
      item.cost *= this.player.costMultiplier;
      return item;
    });
    super.render({
      items: this.items
    });
  }

  update() {
    var self = this;
    _.each(_.zip(this.items, this.subviews), function(v, i) {
      var item = self.processItem(v[0]);
      if (!_.isEqual(v[0], item)) {
        self.items[i] = item;
        v[1].el.find('button').replaceWith(button(item));
      }
    });

    this.el.find('.current-cash-value').text(
      `Cash: ${util.formatCurrency(this.player.company.cash)}`
    );
  }

  processItem(item) {
    var player = this.player,
        item = _.clone(item);
    return _.extend(item, {
      owned: util.contains(player.company.lobbies, item),
      afford: player.company.cash >= item.cost,
      in_progress: _.some(player.company.tasks, function(t) {
        return t.obj.name == item.name;
      })
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
