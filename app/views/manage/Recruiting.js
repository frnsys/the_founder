import _ from 'underscore';
import util from 'util';
import HiringView from './Hiring';
import CardsList from 'views/CardsList';
import recruitments from 'data/recruitments.json';


function button(item) {
  if (item.noAvailableSpace) {
    return '<button disabled>Not enough space</button>';
  } else if (item.afford) {
    return '<button class="buy">Recruit</button>';
  } else {
    return '<button disabled>Not enough cash</button>';
  }
}

const detailTemplate = item => `
<div class="title">
  <h1>${item.name}</h1>
  <h4 class="cash">${util.formatCurrency(item.cost)}</h4>
</div>
<img src="assets/recruitments/${util.slugify(item.name)}.png">
<p>${item.description}</p>
${button(item)}
`

class View extends CardsList {
  constructor(player, office) {
    super({
      title: 'Recruiting',
      detailTemplate: detailTemplate,
      handlers: {
        '.buy': function() {
          if (player.company.pay(this.selected.cost)) {
            var hiring = new HiringView(player, office, this.selected);
            hiring.render();
          }
        }
      }
    });
    this.player = player;
  }

  render() {
    var player = this.player,
        items = _.filter(recruitments, function(i) {
          return !i.robots || i.robots == player.specialEffects['Automation'];
        });
    super.render({
      items: _.map(items, i => _.extend({
        afford: player.company.cash >= i.cost,
        noAvailableSpace: player.company.remainingSpace == 0
      }, i))
    });
  }
}

export default View;

