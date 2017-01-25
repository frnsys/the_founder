import $ from 'jquery';
import _ from 'underscore';
import util from 'util';
import View from 'views/View';
import Popup from 'views/Popup';

const helpTemplate = data => `
<div class="market-help-body">
  <p>The Market is the magical place where your products duke it out with competitors' products for market share.</p>
  <p><img src='assets/onboarding/market_income.png'>The tiles with dollar signs are different pieces of market share of varying income levels.</p>
  <p><img src='assets/onboarding/market_share.png'>Your product's revenue depends on how much market share you can <em class='concept'>capture</em> from The Market.</p>
  <p><img src='assets/onboarding/market_product.png'>The <em class='concept'>blue spheres</em> on the map represent your products. Their <em class='concept'>strength</em> and <em class='concept'>movement</em> are influenced by the Product Designer.</p>
  <p><img src='assets/onboarding/market_movement.gif'>To move a product, <em class='ui-item'>drag</em> it and then <em class='ui-item'>drop</em> it onto a highlighted tile.</p>
  <p><img src='assets/onboarding/market_capture.gif'><em class='ui-item'>Double-click</em> on the product to <em class='concept'>capture</em> the market share tile underneath.</p>
  <p><img src='assets/onboarding/market_combat.gif'><em class='ui-item'>Drag</em> a product onto an enemy product to fight and possibly destroy it.</p>
  <p><img src='assets/onboarding/market_influencer.png'>You may encounter special <em class='special'>Social Media Influencer</em> tiles, noted by an 'i' which give you big revenue bonuses.</p>
  <p>The Market battle ends when there are no more market shares left to capture, if one player is eliminated, or if the turns run out. Good Luck!</p>
</div>
`;

class MarketHelpView extends Popup {
  constructor() {
    super({
      title: 'Market Help',
      template: helpTemplate
    });
  }
}


function healthBar(health, maxHealth) {
  var str = '<span class="health">';
  for (var i=0; i<health; i++) {
    str += '▮';
  }
  str += '</span><span class="no-health">';
  for (var i=0; i<maxHealth-health; i++) {
    str += '▮';
  }
  str += '</span>';
  return str;
}

const pieceInfoTemplate = tile => `
<div class="piece-info">
  <h5>Selected Product</h5>
  <span class="${tile.pieceClass} piece-name">
    ${tile.piece.name ? tile.piece.name : 'Generic Product'}
  </span>
  <div>Strength: ${healthBar(tile.piece.health, tile.piece.maxHealth)} (${tile.piece.health}/${tile.piece.maxHealth})</div>
  ${tile.piece.moves === 0 ? '<div class="piece-no-moves">No moves left</div>' : `<div>Moves: ${tile.piece.moves}</div>`}
</div>`;

const tileInfoTemplate = tile => `
<div class="tile-info">
  <h5>Selected Tile</h5>
  <span class="${tile.tileClass} tile-name">${tile.owner ? tile.owner.company.name + ' ' : ''}${tile.name}</span>
  ${tile.capturing ? `<span>${tile.capturedCost}/${tile.baseCost} captured</span>` : ''}
  ${tile.bonus ? `<span>+${tile.bonus}</span>` : ''}
  <p class="tile-description">${tile.description}</p>
</div>
`;

const template = data => `
<div class="market">
  <div class="turn-notice ${data.human ? 'turn-human' : ''}"><span>${data.human ? 'Your turn' : 'Competitor turn'}</span></div>
  <div class="player-info">
    <h4 class="turns-left">${data.totalTurns - data.turnsLeft}/${data.totalTurns}</h4>
    <div class="progress-bar">
      <div class="progress-bar-fill" style="width:${data.turnsPercent}%"></div>
    </div>
  </div>
  ${data.tile.name ? tileInfoTemplate(data.tile) : ''}
  ${data.tile.piece ? pieceInfoTemplate(data.tile) : ''}
  <button class="end-turn" ${data.human ? '' : 'disabled'}>
    ${data.human ? 'End Turn' : 'Competitor turn...'}
  </button>
</div>
<h1 class="market-title">The Market <div class="show-market-help">?</div></h1>
<div class="market-tutorial"></div>
`;

class Market extends View {
  constructor(params) {
    super(_.extend({
      parent: '.market-ui',
      template: template
    }, params));
    this.registerHandlers({
      '.show-market-help': function() {
        var view = new MarketHelpView();
        view.render();
      }
    });
  }

  postRender() {
    super.postRender();
    $('.market-wrapper, .market-ui').show();
  }

  postRemove() {
    super.postRemove();
    $('.market-wrapper, .market-ui').hide();
  }
}

export default Market;
