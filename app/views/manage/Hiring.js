import _ from 'underscore';
import util from 'util';
import Worker from 'game/Worker';
import Hiring from 'game/Hiring';
import CardsList from 'views/CardsList';
import NegotiationView from './Negotiation';

const template = data =>
  `${data.items.length > 0 ? '<ul class="cards"></ul>' : 'No candidates'}`;

function button(item) {
  if (item.owned) {
    return `<button disabled>Hired</button>`;
  } else if (item.noAvailableSpace) {
    return `<button disabled>Not enough space</button>`;
  } else {
    return `<button class="start-negotiation">Negotiate</button>`;
  }
}

const attributeTemplate = item => `
  <ul class="worker-attributes">
    ${item.attributes.map(i => `
      <li data-tip="<ul>${Worker.attributeToStrings(i).map(s => `<li>${s}</li>`).join('')}</ul>">${i}</li>
    `).join('')}
  </ul>
`;

const detailTemplate = item => `
<div class="worker-avatar">
  <img src="/assets/workers/gifs/${item.avatar}.gif">
</div>
<div class="worker-info">
  <div class="worker-title">
    <h1>${item.name}</h1>
    <h3 class="subtitle">${item.title}</h3>
  </div>
  <div class="worker-body">
    <ul class="worker-stats">
      <li data-tip="Productivity"><img src="/assets/company/productivity.png"> ${util.abbreviateNumber(Math.round(item.productivity), 0)}</li>
      <li data-tip="Design"><img src="/assets/company/design.png"> ${util.abbreviateNumber(Math.round(item.design), 0)}</li>
      <li data-tip="Marketing"><img src="/assets/company/marketing.png"> ${util.abbreviateNumber(Math.round(item.marketing), 0)}</li>
      <li data-tip="Engineering"><img src="/assets/company/engineering.png"> ${util.abbreviateNumber(Math.round(item.engineering), 0)}</li>
      <li data-tip="Happiness"><img src="/assets/company/happiness.png"> ${util.abbreviateNumber(Math.round(item.happiness), 0)}</li>
    </ul>
    ${item.attributes.length > 0 ? attributeTemplate(item) : ''}
  </div>
  ${button(item)}
</div>
`

class View extends CardsList {
  constructor(player, office, recruitment) {
    var candidates = Hiring.recruit(recruitment, player, player.company);
    super({
      title: 'Candidates',
      template: template,
      detailTemplate: detailTemplate
    });
    this.player = player;
    this.recruitment = recruitment;
    this.candidates = candidates;

    this.registerHandlers({
      '.start-negotiation': function(ev) {
        var idx = this.itemIndex(ev.target);
        this.negotiationView = new NegotiationView(player, office, this.candidates[idx], this);
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
    super.render({
      items: this.candidates
    });
  }
}

export default View;

