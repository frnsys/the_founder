import _ from 'underscore';
import util from 'util';
import Effect from 'game/Effect';
import DetailList from 'views/DetailList';
import technologies from 'data/technologies.json';


function button(item) {
  if (item.owned) {
    return '<button disabled>Owned</button>';
  } else if (item.not_available) {
    return '<button disabled>Missing prerequisites</button>';
  } else if (item.afford) {
    return '<button class="buy">Buy</button>';
  } else {
    return '<button disabled>Not enough cash</button>';
  }
}

function detailTemplate(item) {

var prereqs = '';
if (item.prereqs.length) {
  prereqs = `
  <div class="prereqs">
    <h6>Prerequisites</h6>
    <ul class="required">
      ${item.prereqs.map(i => `
        <li class="${i.ok ? 'ok' : ''}">${i.name}</li>
      `).join('')}
    </ul>
  </div>`;
  }

return `
  <img src="assets/techs/${util.slugify(item.name)}.png">
  <div class="title">
    <h1>${item.name}</h1>
    <h4 class="cash">${util.formatCurrencyAbbrev(item.cost)}</h4>
  </div>
  <h5>Requires the ${item.requiredVertical} vertical</h5>
  ${prereqs}
  <ul class="effects">
    ${item.effects.map(e => `
      <li>${Effect.toString(e)}</li>
    `).join('')}
  </ul>
  ${button(item)}`;
}

class View extends DetailList {
  constructor(player) {
    super({
      title: 'Research',
      background: 'rgb(88, 136, 144)',
      background: '#6a53f6',
      dataSrc: technologies,
      detailTemplate: detailTemplate,
      handlers: {
        '.buy': function() {
          player.company.buyResearch(this.selected);
          this.renderDetailView(this.selected);
        }
      }
    });
    this.player = player;
  }

  render() {
    var player = this.player;
    super.render({
      items: _.map(technologies, function(i) {
        return _.extend({
          owned: util.contains(player.company.technologies, i)
        }, i);
      })
    });
  }

  renderDetailView(selected) {
    var player = this.player;
    this.detailView.render(_.extend({
      owned: util.contains(this.player.company.technologies, selected),
      afford: this.player.company.cash >= selected.cost,
      not_available: !player.company.researchIsAvailable(selected),
      prereqs: _.map(selected.requiredTechs, function(t) {
        return {
          name: t,
          ok: util.containsByName(player.company.technologies, t)
        }
      })
    }, selected));
  }
}

export default View;

