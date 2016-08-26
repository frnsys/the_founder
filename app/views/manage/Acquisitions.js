import _ from 'underscore';
import util from 'util';
import templ from '../Common';
import View from 'views/View';
import CardsList from 'views/CardsList';
import acquisitions from 'data/acquisitions.json';


function button(item) {
  if (item.owned) {
    return '<button disabled>Owned</button>';
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
<figure>
  <img src="assets/competitors/${util.slugify(item.name)}.svg">
</figure>
<p>${item.description}</p>
<h5 class="revenue">Generates ${util.formatCurrencyAbbrev(item.revenue)} per year</h5>
${item.effects.length > 0 ? templ.effects(item) : ''}
${button(item)}`;

class AcquisitionsView extends CardsList {
  constructor(player) {
    super({
      title: 'Acquisitions',
      detailTemplate: detailTemplate,
      handlers: {
        '.buy': function(ev) {
          var idx = this.itemIndex(ev.target),
              sel = acquisitions[idx];
          player.company.buyAcquisition(sel);
          this.subviews[idx].render(this.processItem(sel));
        }
      }
    });
    this.player = player;
  }

  render() {
    super.render({
      items: _.map(acquisitions, this.processItem.bind(this))
    });
  }

  processItem(item) {
    var player = this.player;
    return _.extend({
      owned: util.contains(player.company.acquisitions, item),
      afford: player.company.cash >= item.cost
    }, item);
  }

  createListItem(item) {
    return new View({
      tag: 'li',
      parent: this.el.find('ul'),
      template: this.detailTemplate,
      method: 'append',
      attrs: {
        class: `${util.slugify(item.name)}`
      }
    });
  }
}

export default AcquisitionsView;
