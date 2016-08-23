import $ from 'jquery';
import _ from 'underscore';
import util from 'util';
import View from 'views/View';

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
  <span class="${tile.pieceClass}">
    ${tile.piece.name ? tile.piece.name : 'Generic Product'}
  </span> (moves: ${tile.piece.moves})
  <div>Health: ${healthBar(tile.piece.health, tile.piece.maxHealth)} (${tile.piece.health}/${tile.piece.maxHealth})</div>
</div>`;

const tileInfoTemplate = tile => `
<div class="tile-info">
  <span class="${tile.tileClass}">${tile.owner ? tile.owner.company.name + ' ' : ''}${tile.name}</span>
  ${tile.capturing ? `<span>${tile.capturedCost}/${tile.baseCost} captured</span>` : ''}
  ${tile.bonus ? `<span>${tile.bonus} hype</span>` : ''}
    <p class="tile-description">${tile.description}</p>
</div>
`;

const template = data => `
<div class="market">
  <div class="player-info">
    <h4 class="turns-left">${data.turnsLeft}/${data.totalTurns}</h4>
    <div class="progress-bar">
      <div class="progress-bar-fill" style="width:${data.turnsPercent}%"></div>
    </div>
  </div>
  ${data.tile.name ? tileInfoTemplate(data.tile) : ''}
  ${data.tile.piece ? pieceInfoTemplate(data.tile) : ''}
  <button class="end-turn">End Turn</button>
</div>
<h1 class="market-title">The Market</h1>
`;

class Market extends View {
  constructor(params) {
    super(_.extend({
      parent: $('.market-wrapper'),
      el: $('.market-ui'),
      template: template,
    }, params));
  }
}

export default Market;
