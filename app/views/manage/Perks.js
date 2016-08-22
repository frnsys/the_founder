import _ from 'underscore';
import util from 'util';
import Perk from 'game/Perk';
import Effect from 'game/Effect';
import DetailList from 'views/DetailList';
import perks from 'data/perks.json';


function detailTemplate(item) {
  var html = [];
  if (item.owned) {
    html.push(`
      <div class="owned-perk">
        <h5>Current Perk</h5>
        <img src="assets/perks/gifs/${util.slugify(item.current.name)}.gif">
        <div class="info">
          <h1>${item.current.name}</h1>
          <p>${item.current.description}</p>
          <ul class="effects">
            ${item.current.effects.map(e => `
              <li>${Effect.toString(e)}</li>
            `).join('')}
          </ul>
        </div>
      </div>
    `);
  }

  if (item.nextAvailable) {
    var button;
    if (item.afford) {
      button = '<button class="buy">Buy</button>';
    } else {
      button = '<button disabled>Not enough cash</button>';
    }
    html.push(`
      <div class="next-perk">
        <img src="assets/perks/gifs/${util.slugify(item.next.name)}.gif">
        <div class="title">
          <h1>${item.next.name}</h1>
          <h4 class="cash">${util.formatCurrencyAbbrev(item.next.cost)}</h4>
        </div>
        <p>${item.next.description}</p>
        <ul class="effects">
          ${item.next.effects.map(e => `
            <li>${Effect.toString(e)}</li>
          `).join('')}
        </ul>
        ${button}
      </div>
    `);
  }
  return html.join('');
}

class View extends DetailList {
  constructor(player, office) {
    var availablePerks = _.filter(perks, function(p) {
      if (!player.company.hasPerk(p)) {
        return Perk.isAvailable(p.upgrades[0], player.company);
      }
      return true;
    });
    super({
      title: 'Perks',
      background: 'rgb(88, 136, 144)',
      dataSrc: availablePerks,
      detailTemplate: detailTemplate,
      handlers: {
        '.buy': function() {
          var perk,
              owned = player.company.hasPerk(this.selected);
          if (!owned) {
            perk = Perk.init(this.selected);
          } else {
            perk = util.byName(this.player.company.perks, this.selected.name);
          }
          if (player.company.buyPerk(perk)) {
            office.addPerk(Perk.current(perk));
            this.renderDetailView(perk);
          }
        }
      }
    });
    this.player = player;
    this.availablePerks = availablePerks;
  }

  render() {
    var player = this.player;
    player.onboard('perks'); // TODO this should be handled by the manager not the view
    super.render({
      items: _.map(this.availablePerks, function(i) {
        return _.extend({
          owned: util.contains(player.company.perks, i)
        }, i);
      })
    });
  }

  renderDetailView(selected) {
    var perk,
        owned = this.player.company.hasPerk(selected)
    if (!owned) {
      perk = Perk.init(this.selected);
    } else {
      perk = util.byName(this.player.company.perks, selected.name);
    }

    var current = Perk.current(perk),
        next = owned ? Perk.next(perk) : current,
        hasNext = owned ? Perk.hasNext(perk) : true,
        nextAvailable = Perk.isAvailable(next, this.player.company),
        afford = hasNext && this.player.company.cash >= next.cost;

    this.detailView.render(_.extend({
      owned: owned,
      afford: afford,
      hasNext: hasNext,
      current: current,
      nextAvailable: nextAvailable,
      next: next
    }, perk));
  }
}

export default View;
