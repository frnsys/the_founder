import _ from 'underscore';
import util from 'util';
import templ from '../Common';
import Perk from 'game/Perk';
import CardsList from 'views/CardsList';
import perks from 'data/perks.json';


function detailTemplate(item) {
  var html = [];
  if (item.owned) {
    html.push(`
      <div class="owned-perk">
        <h5>Current Perk</h5>
        <h1>${item.current.name}</h1>
        <img src="assets/perks/gifs/${util.slugify(item.current.name)}.gif">
      ${templ.effects(item.current)}
      </div>
    `);
  } else {
    html.push('<div class="owned-perk"><h1 class="unowned">You don\'t have this perk yet.</h1></div>');
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
        <div class="title">
          <h1>${item.next.name}</h1>
          <h4 class="cash">${util.formatCurrency(item.next.cost)}</h4>
        </div>
        <img src="assets/perks/gifs/${util.slugify(item.next.name)}.gif">
        <div class="perk-info">
          <p>${item.next.description}</p>
          ${templ.effects(item.next)}
          ${button}
        </div>
      </div>
    `);
  }
  return html.join('');
}

class View extends CardsList {
  constructor(player, office) {
    var availablePerks = _.filter(perks, function(p) {
      if (!player.company.hasPerk(p)) {
        return Perk.isAvailable(p.upgrades[0], player.company);
      }
      return true;
    });
    super({
      title: 'Perks',
      detailTemplate: detailTemplate,
      handlers: {
        '.buy': function(ev) {
          var idx = this.itemIndex(ev.target),
              perk = this.availablePerks[idx],
              owned = player.company.hasPerk(perk);
          if (!owned) {
            perk = Perk.init(perk);
          } else {
            perk = util.byName(this.player.company.perks, perk);
          }
          if (player.company.buyPerk(perk)) {
            office.addPerk(Perk.current(perk));
            this.subviews[idx].render(this.processItem(perk));
          }
        }
      }
    });
    this.player = player;
    this.availablePerks = availablePerks;
  }

  render() {
    super.render({
      items: _.map(this.availablePerks, this.processItem.bind(this))
    });
  }

  processItem(item) {
    var perk,
        player = this.player,
        owned = player.company.hasPerk(item)
    if (!owned) {
      perk = Perk.init(item);
    } else {
      perk = util.byName(player.company.perks, item.name);
    }

    var current = Perk.current(perk),
        next = owned ? Perk.next(perk) : current,
        hasNext = owned ? Perk.hasNext(perk) : true;
    return _.extend({
      owned: owned,
      current: current,
      next: next,
      hasNext: hasNext,
      nextAvailable: Perk.isAvailable(next, player.company),
      afford: hasNext && player.company.cash >= next.cost
    }, item);
  }
}

export default View;
