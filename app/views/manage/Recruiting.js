import _ from 'underscore';
import util from 'util';
import HiringView from './Hiring';
import CardsList from 'views/CardsList';
import recruitments from 'data/recruitments.json';


function button(item) {
  if (item.noAvailableSpace) {
    return '<button disabled>Office is full</button>';
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
          if (player.company.pay(selected.cost * player.costMultiplier)) {
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
    this.items = _.map(this.items, this.processItem.bind(this));
    super.render({items: this.items});
    this.robots = this.player.specialEffects['Automation'];
  }

  processItem(item) {
    var player = this.player,
        item = _.clone(item);
    item.cost *= this.player.costMultiplier;
    return _.extend(item, {
      afford: player.company.cash >= item.cost,
      noAvailableSpace: player.company.remainingSpace == 0
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

    // if robots become available while this view is open, re-render
    if (this.player.specialEffects['Automation'] != this.robots){
      this.render();
    }
  }
}

export default View;

