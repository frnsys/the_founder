import _ from 'underscore';
import util from 'util';
import Worker from 'game/Worker';
import Hiring from 'game/Hiring';
import DetailList from 'views/DetailList';
import NegotiationView from './Negotiation';

const template = function(data) {
  var list;
  if (data.items) {
    list = `<ul class="list">
      ${data.items.map(i => `
        <li>${i.name}</li>
      `).join('')}
    </ul>`;
  } else {
    list = 'No candidates found';
  }
  return `
    <div class="split-pane ${util.slugify(data.title)}">
      ${list}
      <div class="detail"></div>
    </div>`;
}

function button(item) {
  if (item.owned) {
    return `<button disabled>Hired</button>`;
  } else if (item.noAvailableSpace) {
    return `<button disabled>Not enough space</button>`;
  } else {
    return `<button class="start-negotiation">Negotiation</button>`;
  }
}

const attributeTemplate = item => `
  <h5>Attributes</h5>
  <ul>
    ${item.attributes.map(i => `
      <li data-tip="<ul>${Worker.attributeToStrings(i).map(s => `<li>${s}</li>`).join('')}</ul>">${i}</li>
    `).join('')}
  </ul>
`;

const detailTemplate = item => `
<img src="/assets/workers/gifs/${item.avatar}.gif">
<div class="title">
  <h1>${item.name}</h1>
  <p class="subtitle">${item.title}</p>
</div>
<ul>
  <li>Productivity: ${Math.round(item.productivity)}</li>
  <li>Design: ${Math.round(item.design)}</li>
  <li>Engineering: ${Math.round(item.engineering)}</li>
  <li>Marketing: ${Math.round(item.marketing)}</li>
</ul>
${item.attributes.length > 0 ? attributeTemplate(item) : ''}
${button(item)}
`

class View extends DetailList {
  constructor(player, office, recruitment) {
    var candidates = Hiring.recruit(recruitment, player, player.company);
    super({
      title: 'Candidates',
      background: 'rgb(45, 89, 214)',
      dataSrc: candidates,
      template: template,
      detailTemplate: detailTemplate
    });
    this.player = player;
    this.recruitment = recruitment;
    this.candidates = candidates;

    this.registerHandlers({
      '.start-negotiation': function() {
        this.negotiationView = new NegotiationView(player, office, this.selected, this);
        this.remove();
      }
    });
  }

  postRemove() {
    super.postRemove();
    if (this.negotiationView) {
      this.negotiationView.render();
    }
  }

  postRender() {
    super.postRender();
    this.negotiationView = null;
  }

  render() {
    // re-filter candidates in case some have gone off the market
    var player = this.player;
    this.candidates = _.filter(this.candidates, c => c.offMarketTime == 0);
    this.dataSrc = this.candidates;
    super.render({
      items: this.candidates
    });
  }

  renderDetailView(selected) {
    var player = this.player;
    this.detailView.render(_.extend({
      noAvailableSpace: player.company.remainingSpace == 0,
      owned: util.contains(player.company.workers, selected)
    }, selected));
  }
}

export default View;

