import util from 'util';
import Alert from './Alert';

function abbrevCurrency(amount) {
  if (amount < 100000000) {
    return util.formatCurrency(amount);
  }
  return util.formatCurrencyAbbrev(amount);
}

const template = data => `
<div class="alert-message alert-market-report alert-pop">
  <img src="assets/company/market.png" class="alert-icon">
  <h1>Market Report</h1>
  <p>We captured <span class="market-report-share">${data.marketShare.toFixed(2)}%</span> of the market, representing a base revenue of <span class="market-report-base-revenue">${abbrevCurrency(data.baseRevenue)}</span>.</p>
  <ul class="market-report-bonuses">
    <li>x${data.spendingMultiplier} from consumer spending bonuses</li>
    <li>x${data.hypeMultiplier.toFixed(2)} from hype</li>
    <li>x${data.influencerMultiplier} from social media influencers</li>
    <li>x${data.economyMultiplier} from economic health</li>
    <li>x${data.locationMarketMultiplier.toFixed(2)} from locations</li>
    ${data.newDiscoveryMuliplier > 1 ? `<li>x${data.newDiscoveryMuliplier} from the new product bonus</li>` : ''}
  </ul>
  <div class="market-report-revenue">
    <h3>Revenue projections</h3>
    <h1>${abbrevCurrency(data.revenue)}</h1>
  </div>
  <div class="alert-actions">
    <button class="dismiss-alert">OK</button>
  </div>
</div>
`

class MarketReport extends Alert {
  constructor() {
    super({
      template: template
    });
  }
}

export default MarketReport;
