import $ from 'jquery';
import _ from 'underscore';
import util from 'util';
import View from 'views/View';
import Popup from 'views/Popup';

const template = data => `
<div class="market-share">
  <div class="human-market-share" style="width:${data.marketShares.human}%"><h1>Your market share: ${data.marketShares.human.toFixed(1)}%</h1></div>
  <div class="ai-market-share" style="width:${data.marketShares.ai}%"><div class="market-share-text-wrapper"><h1>${data.competitor.name}'s market share: ${data.marketShares.ai.toFixed(1)}%</h1></div></div>
</div>
`;

class MarketShare extends View {
  constructor(params) {
    super(_.extend({
      parent: '.market-share-wrapper',
      template: template
    }, params));
  }
}

export default MarketShare;
