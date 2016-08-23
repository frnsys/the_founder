import _ from 'underscore';
import util from 'util';
import HiringView from './Hiring';
import DetailList from 'views/DetailList';
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
<img src="assets/recruitments/${util.slugify(item.name)}.png">
<div class="title">
  <h1>${item.name}</h1>
  <h4 class="cash">${util.formatCurrency(item.cost)}</h4>
</div>
<p>${item.description}</p>
${button(item)}
`

class View extends DetailList {
  constructor(player, office) {
    super({
      title: 'Recruiting',
      background: 'rgb(45, 89, 214)',
      dataSrc: recruitments,
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
    var player = this.player;
    super.render({
      items: _.filter(recruitments, function(i) {
        return !i.robots || i.robots == player.specialEffects['Automation'];
      })
    });
  }

  renderDetailView(selected) {
    var player = this.player;
    this.detailView.render(_.extend({
      afford: player.company.cash >= selected.cost,
      noAvailableSpace: player.company.remainingSpace == 0
    }, selected));
  }
}

export default View;

