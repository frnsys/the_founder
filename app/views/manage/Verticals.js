import _ from 'underscore';
import util from 'util';
import DetailList from 'views/DetailList';
import verticals from 'data/verticals.json';


function button(item) {
  if (item.owned) {
    return '<button disabled>Owned</button>';
  } else if (item.afford) {
    return '<button class="buy">Expand to this vertical</button>';
  } else {
    return '<button disabled>Not enough cash</button>';
  }
}

const detailTemplate = item => `
<img src="assets/verticals/${util.slugify(item.name)}.gif">
<div class="title">
  <h1>${item.name}</h1>
  <h4 class="cash">${util.formatCurrencyAbbrev(item.cost)}</h4>
</div>
<p>${item.description}</p>
${button(item)}
`

class View extends DetailList {
  constructor(player) {
    super({
      title: 'Verticals',
      background: 'rgb(243, 227, 255)',
      dataSrc: verticals,
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
      items: _.map(verticals, function(i) {
        return _.extend({
          owned: util.contains(player.company.verticals, i)
        }, i);
      })
    });
  }

  renderDetailView(selected) {
    this.detailView.render(_.extend({
      owned: util.contains(this.player.company.verticals, selected),
      afford: this.player.company.cash >= selected.cost
    }, selected));
  }
}

export default View;

