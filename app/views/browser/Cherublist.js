import util from 'util';

const template = data => `
<div class="site-header">
  <h1>cherublist</h1>
  <div class="meta">find the investor of your dreams</div>
</div>
<div class="site-body">
  <div class="header">
    <h1>${data.name}</h1>
    <h6>Founded ${data.companyAge} years ago</h6>
    <h6>${data.hype} people talking about ${data.name}</h6>
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
            <h1>${data.marketing}</h1>
        </li>
        <li>
            <h5>Design</h5>
            <h1>${data.design}</h1>
        </li>
        <li>
            <h5>Engineering</h5>
            <h1>${data.engineering}</h1>
        </li>
        <li>
            <h5>Productivity</h5>
            <h1>${data.productivity}</h1>
        </li>
      </ul>
      <div class="meta">Employee satisfaction: ${data.happiness}</div>
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
          <h1>${data.boardStatus}</h1>
        </li>
        <li>
          <h5>Profit Target</h5>
          <h1>${util.formatCurrency(data.profitTarget)}</h1>
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
          <h1>${util.formatCurrency(data.cash)}</h1>
        </li>
        <li>
          <h5>YTD Revenue</h5>
          <h1>${util.formatCurrency(data.ytdRevenue)}</h1>
          <h6>${util.formatCurrency(data.revenueChange)} change</h6>
        </li>
        <li>
          <h5>YTD Profit</h5>
          <h1>${util.formatCurrency(data.ytdProfit)}</h1>
          <h6>${util.formatCurrency(data.profitChange)} change</h6>
        </li>
        <li>
          <h5>Lifetime Revenue</h5>
          <h1>${util.formatCurrencyAbbrev(data.lifetimeRevenue)}</h1>
        </li>
        <li>
          <h5>Annual Costs</h5>
          <h1>${util.formatCurrency(data.ytdCosts)}</h1>
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
      <h5>${data.n_technologies} technologies discovered</h5>
    </section>
  </div>
</div>
`

export default template;
