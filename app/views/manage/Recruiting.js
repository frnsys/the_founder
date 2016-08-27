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
        '.buy': function(ev) {
          var idx = this.itemIndex(ev.target),
              selected = recruitments[idx];
          if (player.company.pay(selected.cost)) {
            var hiring = new HiringView(player, office, selected);
            hiring.render();
          }
        }
      }
    });
    this.player = player;
    this.items = _.filter(recruitments, function(i) {
      return !i.robots || i.robots == player.specialEffects['Automation'];
    });
  }

  render() {
    super.render({
      items: _.map(this.items, this.processItem.bind(this))
    });
  }

  processItem(item) {
    var player = this.player;
    return _.extend({
      afford: player.company.cash >= item.cost,
      noAvailableSpace: player.company.remainingSpace == 0
    }, item);
  }

  update() {
    var self = this;
    // TODO what if robots become available while viewing the popup?
    _.each(_.zip(this.items, this.subviews), function(v) {
      v[1].el.find('button').replaceWith(button(self.processItem(v[0])));
    });
  }
}

export default View;

