import $ from 'jquery';
import _ from 'underscore';
import util from 'util';
import View from 'views/View';
import Datamap from 'datamaps';
import markets from 'data/markets.json';
import locations from 'data/locations.json';
import map from 'data/map.json';


const template = data => `
<div class="site-header">
  <h1>cherublist</h1>
  <div class="meta">find the investor of your dreams</div>
</div>
<div class="site-body">
  <div class="header">
    <h1>${data.name}</h1>
    <h6>Founded <span class="stat-company-age">${data.companyAge}</span> years ago</h6>
    <h6><span class="stat-hype">${Math.floor(data.hype)}</span> people talking about ${data.name}</h6>
  </div>
  <div class="cherublist-left">
    <section class="team">
      <div class="section-header">
        <h2>Team</h2>
        <div class="meta">${data.employees} employees</div>
      </div>
      <ul class="grid">
        <li>
            <h5>Marketing</h5>
            <h1 class="stat-marketing">${data.marketing}</h1>
        </li>
        <li>
            <h5>Design</h5>
            <h1 class="stat-design">${data.design}</h1>
        </li>
        <li>
            <h5>Engineering</h5>
            <h1 class="stat-engineering">${data.engineering}</h1>
        </li>
        <li>
            <h5>Productivity</h5>
            <h1 class="stat-productivity">${data.productivity}</h1>
        </li>
      </ul>
      <div class="meta">Employee satisfaction: <span class="stat-happiness">${Math.floor(data.happiness)}</span></div>
    </section>
    <section class="locations">
      <div class="section-header">
        <h2>Locations</h2>
        <div class="meta">Offices in ${data.n_locations} locations</div>
      </div>
      <div class="map" id="map"></div>
      <h4>
        Global coverage: ${data.globalCoverage}%
        ${data.hasExtraTerra ? '+ The Extraterrestial Colonies' : ''}
        ${data.hasAlien ? '+ The Alien Worlds' : ''}
      </h4>
    </section>
    <section class="founders">
      <div class="section-header">
        <h2>Founders</h2>
      </div>
      <ul class="grid">
          <li>
            <img src="assets/workers/gifs/0.gif">
            <h5>You</h5>
          </li>
          <li>
            <img src="assets/workers/gifs/${data.cofounder.avatar}.gif">
            <h5>${data.cofounder.name}</h5>
          </li>
      </ul>
    </section>
  </div>
  <div class="cherublist-right">
    <section class="investors">
      <div class="section-header">
        <h2>Investors</h2>
      </div>
      <ul class="grid">
        <li>
          <h5>Investor mood</h5>
          <h1 class="stat-board-status">${data.boardStatus}</h1>
        </li>
        <li>
          <h5>Profit Target</h5>
          <h1 class="stat-profit-target">${util.formatCurrency(data.profitTarget)}</h1>
        </li>
      </ul>
    </section>
    <section class="financials">
      <div class="section-header">
        <h2>Financials</h2>
      </div>
      <ul class="grid">
        <li>
          <h5>Cash</h5>
          <h1 class="stat-cash">${util.formatCurrency(data.cash)}</h1>
        </li>
        <li>
          <h5>YTD Revenue</h5>
          <h1 class="stat-ytd-revenue">${util.formatCurrency(data.ytdRevenue)}</h1>
          <h6 class="stat-revenue-change">${util.formatCurrency(data.revenueChange)} change</h6>
        </li>
        <li>
          <h5>YTD Profit</h5>
          <h1 class="stat-ytd-profit">${util.formatCurrency(data.ytdProfit)}</h1>
          <h6 class="stat-profit-change">${util.formatCurrency(data.profitChange)} change</h6>
        </li>
        <li>
          <h5>Lifetime Revenue</h5>
          <h1 class="stat-lifetime-revenue">${util.formatCurrencyAbbrev(data.lifetimeRevenue)}</h1>
        </li>
        <li>
          <h5>Annual Costs</h5>
          <h1 class="stat-ytd-costs">${util.formatCurrency(data.ytdCosts)}</h1>
          <ul>
            <li>Rent: ${util.formatCurrency(data.rent)}</li>
            <li>Salaries: ${util.formatCurrency(data.salaries)}</li>
          </ul>
        </li>
      </ul>
    </section>
    <section class="innovation">
      <div class="section-header">
        <h2>Innovation</h2>
      </div>
      <h5><span class="stat-technologies">${data.n_technologies}</span> technologies discovered</h5>
    </section>
  </div>
</div>
`

class CherublistView extends View {
  constructor(player) {
    super({
      parent: '.cherublist',
      template: template
    });
    this.player = player;
  }

  update(data) {
    // sorrrrrryyy
    $('.stat-company-age').text(data.companyAge);
    $('.stat-hype').text(Math.floor(data.hype));
    $('.stat-technologies').text(data.n_technologies);
    $('.stat-marketing').text(data.marketing);
    $('.stat-design').text(data.design);
    $('.stat-engineering').text(data.engineering);
    $('.stat-productivity').text(data.productivity);
    $('.stat-happiness').text(Math.floor(data.happiness));
    $('.stat-board-status').text(data.boardStatus);
    $('.stat-profit-target').text(util.formatCurrency(data.profitTarget));
    $('.stat-cash').text(util.formatCurrency(data.cash));
    $('.stat-ytd-revenue').text(util.formatCurrency(data.ytdRevenue));
    $('.stat-revenue-change').text(util.formatCurrency(data.revenueChange));
    $('.stat-ytd-profit').text(util.formatCurrency(data.ytdProfit));
    $('.stat-profit-change').text(util.formatCurrency(data.profitChange));
    $('.stat-lifetime-revenue').text(util.formatCurrency(data.lifetimeRevenue));
    $('.stat-ytd-costs').text(util.formatCurrency(data.ytdCosts));
  }

  postRender() {
    super.postRender();
    var player = this.player;
    var marketPercents = _.object(
      _.map(_.keys(markets), function(m) {
        return m.toLowerCase();
      }),
      _.map(_.values(markets), function(m) {
        var locationsForMarket = _.where(locations, {market: m}),
            ownedLocationsForMarket = _.where(player.company.locations, {market: m}),
            marketPercent = ownedLocationsForMarket.length/locationsForMarket.length;
        if (!marketPercent) {
          return 'rgba(0,0,0,0.1)';
        }
        return 'rgba(255,53,53,'+marketPercent+')';
      })
    );

    var datamap = new Datamap({
      element: document.getElementById('map'),
      fills: _.extend({
        defaultFill: 'rgba(0,0,0,0.1)'
      }, marketPercents),
      data: map, // country fill keys, mapped to continents
      geographyConfig: {
        hideAntarctica: false,
        popupOnHover: false,
        highlightOnHover: false
      }
    });

  }
}

export default CherublistView;
