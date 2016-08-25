import _ from 'underscore';
import util from 'util';
import View from 'views/View';
import Effect from 'game/Effect';
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

const effectsTemplate = item => `
<ul class="effects">
  ${item.effects.map(e => `
    <li>${Effect.toString(e)}</li>
  `).join('')}
</ul>`;

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
${item.effects.length > 0 ? effectsTemplate(item) : ''}
${button(item)}`;

class AcquisitionsView extends CardsList {
  constructor(player) {
    super({
      title: 'Acquisitions',
      detailTemplate: detailTemplate,
      handlers: {
        '.buy': function() {
          player.company.buyAcquisition(this.selected);
          this.renderDetailView(this.selected);
        }
      }
    });
    this.player = player;
  }

  render() {
    var player = this.player;
    super.render({
      items: _.map(acquisitions, function(i) {
        return _.extend({
          owned: util.contains(player.company.acquisitions, i),
          afford: player.company.cash >= i.cost
        }, i);
      })
    });
  }

  createListItem(item) {
    return new View({
      tag: 'li',
      el: this.el.find('ul'),
      template: this.detailTemplate,
      method: 'append',
      attrs: {
        class: `${util.slugify(item.name)}`
      }
    });
  }
}

export default AcquisitionsView;
