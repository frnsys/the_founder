import _ from 'underscore';
import util from 'util';
import Effect from 'game/Effect';
import View from 'views/View';
import Popup from 'views/Popup';
import locations from 'data/locations.json';

function button(item) {
  if (item.owned) {
    return '<button disabled>Owned</button>';
  } else if (item.afford) {
    return '<button class="buy">Expand here</button>';
  } else {
    return '<button disabled>Not enough cash</button>';
  }
}

const effectsTemplate = item => `
<ul class="effects">
  ${item.effects.map(e => `
    <li>${Effect.toString(e)}</li>
  `).join('')}
</ul>`;

const template = data => `<ul class="cards"></ul>`;

const marketTemplate = item => `
  <ul>
    <li class="market-location">
      <h1>${item.name}</h1>
      <img src="assets/markets/${util.slugify(item.name)}.png">
    </li>
  </ul>
`;

// TODO render skills

const locationTemplate = item => `
<div class="title">
  <h1>${item.name}</h1>
  <h4 class="cash">${util.formatCurrencyAbbrev(item.cost)}</h4>
  <ul class="worker-stats">
    <li data-tip="Productivity"><img src="/assets/company/productivity.png"> ${util.abbreviateNumber(Math.round(item.skills.productivity), 0)}</li>
    <li data-tip="Design"><img src="/assets/company/design.png"> ${util.abbreviateNumber(Math.round(item.skills.design), 0)}</li>
    <li data-tip="Marketing"><img src="/assets/company/marketing.png"> ${util.abbreviateNumber(Math.round(item.skills.marketing), 0)}</li>
    <li data-tip="Engineering"><img src="/assets/company/engineering.png"> ${util.abbreviateNumber(Math.round(item.skills.engineering), 0)}</li>
    <li data-tip="Happiness"><img src="/assets/company/happiness.png"> ${util.abbreviateNumber(Math.round(item.skills.happiness), 0)}</li>
  </ul>
</div>
${item.effects.length > 0 ? effectsTemplate(item) : ''}
${button(item)}`;


class MarketView extends View {
  constructor(player, market, locs) {
    super({
      parent: '.cards',
      tag: 'li',
      attrs: {class: 'location-market'},
      template: marketTemplate,
      method: 'append',
      handlers: {
        '.buy': function(ev) {
          var idx = this.itemIndex(ev.target) - 1, // adjust b/c first li is actually the market name
              selected = this.locations[idx];
          player.company.buyLocation(selected);
          this.subviews[idx].render(this.processItem(selected));
        }
      }
    });
    this.player = player;
    this.market = market;
    this.locations = locs;
  }

  processItem(item) {
    return _.extend({
      owned: util.contains(this.player.company.locations, item),
      afford: this.player.company.cash >= item.cost
    }, item);
  }

  render() {
    super.render({
      name: this.market
    });
    if (!this.subviews) {
      this.subviews = _.map(this.locations, i => this.createListItem(i));
    }
    var self = this;
    _.each(_.zip(this.subviews, this.locations), function(si) {
      var subview = si[0],
          item = si[1];
      subview.render(self.processItem(item));
    });
  }

  createListItem(item) {
    return new View({
      tag: 'li',
      parent: this.el.find('ul'),
      template: locationTemplate,
      method: 'append',
      attrs: {class: 'market-location'},
    });
  }
}

class LocationsView extends Popup {
  constructor(player) {
    super({
      title: 'Locations',
      template: template
    });
    this.player = player;
    this.locations = _.filter(locations, l => util.contains(player.unlocked.locations, l));
  }

  render() {
    var player = this.player,
        markets = {};

    // group by market
    _.each(this.locations, function(l) {
      if (!(l.market in markets)) {
        markets[l.market] = [];
      }
      markets[l.market].push(l);
    });

    super.render({});
    this.subviews = _.map(markets, function(locs, m) {
      var mv = new MarketView(player, m, locs);
      mv.render();
      return mv;
    });
  }
}

export default LocationsView;
