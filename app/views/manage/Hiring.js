import _ from 'underscore';
import util from 'util';
import templ from '../Common';
import Hiring from 'game/Hiring';
import CardsList from 'views/CardsList';
import NegotiationView from './Negotiation';

const template = data =>
  `${data.items.length > 0 ? '<ul class="cards"></ul>' : '<h1>No candidates</h1>'}`;

function button(item) {
  if (item.owned) {
    return `<button disabled>Hired</button>`;
  } else if (item.noAvailableSpace) {
    return `<button disabled>Office is full</button>`;
  } else {
    return `<button class="start-negotiation">Negotiate</button>`;
  }
}

const detailTemplate = item => `
<div class="worker-avatar">
  <img src="assets/workers/gifs/${item.avatar}.gif">
</div>
<div class="worker-info">
  <div class="worker-title">
    <h1>${item.name}</h1>
    <h3 class="subtitle">${item.title}</h3>
  </div>
  <div class="worker-body">
    ${templ.skills(item)}
    ${item.attributes.length > 0 ? templ.attributes(item) : ''}
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
    this.candidates = _.filter(this.candidates, c => c.offMarketTime == 0 && !_.contains(player.company.workers, c));
    this.subviews = [];
    super.render({
      items: this.candidates
    });
  }
}

export default View;

