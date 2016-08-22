import _ from 'underscore';
import util from 'util';
import Effect from 'game/Effect';
import DetailList from 'views/DetailList';
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
<img src="assets/placeholder.gif">
<div class="title">
  <h1>${item.name}</h1>
  <h4 class="cash">${util.formatCurrencyAbbrev(item.cost)}</h4>
</div>
<p>${item.description}</p>
<h5 class="revenue">Generates ${util.formatCurrencyAbbrev(item.revenue)} per year</h5>
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
      title: 'Acquisitions',
      background: '#515f78',
      dataSrc: acquisitions,
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
    player.onboard('acquisitions'); // TODO this should be handled by the manager not the view
    super.render({
      items: _.map(acquisitions, function(i) {
        return _.extend({
          owned: util.contains(player.company.acquisitions, i)
        }, i);
      })
    });
  }

  renderDetailView(selected) {
    this.detailView.render(_.extend({
      owned: util.contains(this.player.company.acquisitions, selected),
      afford: this.player.company.cash >= selected.cost
    }, selected));
  }
}

export default View;
