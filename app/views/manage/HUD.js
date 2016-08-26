import _ from 'underscore';
import $ from 'jquery';
import util from 'util';
import Enums from 'app/Enums';
import View from 'views/View';
import Tooltip from 'views/Tooltip';
import NewTaskView from 'views/task/New';

const template = data => `
<div class="hud-left">
  <h4 class="hud-date"></h4>
  <div class="hud-cash"></div>
  <div class="hud-active-products"></div>
</div>
<div class="hud-center"></div>
<div class="hud-right">
  <ul class="hud-stats grid"></ul>
  <div class="hud-actions">
    <div class="start-new-task">New Task</div>
    <div class="hud-product-dev"></div>
    <div class="hud-promo-dev"></div>
  </div>
</div>
`

const productDevTemplate = function(data) {
  var product = data.product;
  if (product) {
    var progressPercent = product.progress/product.requiredProgress * 100;
    return `
      <span class="product-dev-combo">Developing: ${product.combo}</span>
      <div class="progress-bar-outer">
        <div class="progress-bar-inner" style="width:${progressPercent}%"></div>
      </div>
      <ul class="hud-stats grid">
        <li><img src="/assets/company/design.png"> ${product.design}</li>
        <li><img src="/assets/company/marketing.png"> ${product.marketing}</li>
        <li><img src="/assets/company/engineering.png"> ${product.engineering}</li>
      </ul>
    `;
  } else {
    return '<button class="start-product">Start Product</button>';
  }
};

const promoDevTemplate = function(data) {
  var promo = data.promo;
  if (promo) {
    var progressPercent = promo.progress/promo.requiredProgress * 100;
    return `
      <span class="product-dev-combo">Promo: ${promo.name}</span>
      <div class="progress-bar-outer">
        <div class="progress-bar-inner" style="width:${progressPercent}%"></div>
      </div>
      <ul class="hud-stats grid">
        <li><img src="/assets/company/hype.png"> ${promo.hypeGenerated}</li>
      </ul>
    `;
  } else {
    return '<button class="start-promo">Start Promo</button>';
  }
};

const activeProductTemplate = function(data) {
  var products = data.activeProducts;
  if (products) {
    return `
      <ul class="active-products">
        ${products.map(i => `
          <li><span class="active-product-name">${i.name}</span> <span class="cash">${util.formatCurrencyAbbrev(i.earnedRevenue)}</span></li>
        `).join('')}
      </ul>
    `;
  } else {
    return '';
  }
};

const statsTemplate = data => `
${data.onboarding.hype ? `<li data-tip="Hype"><img src="/assets/company/hype.png"> <span class="hype-val">${util.abbreviateNumber(data.hype, 0)}</span></li>` : ''}
${data.onboarding.outrage ? `<li data-tip="Outrage"><img src="/assets/company/outrage.png"> ${util.abbreviateNumber(data.outrage, 0)}</li>` : ''}
<li data-tip="Design"><img src="/assets/company/design.png"> ${util.abbreviateNumber(data.design, 0)}</li>
<li data-tip="Marketing"><img src="/assets/company/marketing.png"> ${util.abbreviateNumber(data.marketing, 0)}</li>
<li data-tip="Engineering"><img src="/assets/company/engineering.png"> ${util.abbreviateNumber(data.engineering, 0)}</li>
<li data-tip="Productivity"><img src="/assets/company/productivity.png"> ${util.abbreviateNumber(data.productivity, 0)}</li>
`;

const timeTemplate = data => `
<span>${util.enumName(data.month, Enums.Month)}, ${data.year}</span>
<ul class="weeks">
  ${_.times(data.week + 1, i => `
    <li class="week-on"></li>
  `).join('')}
  ${_.times(4 - (data.week+1), i => `
    <li class="week-off"></li>
  `).join('')}
</ul>
`;

const boardTemplate = data => `
<h3>The Board is ${data.boardStatus}.</h3>
<div class="hud-profit-progress">
  <div class="progress-bar-outer">
    <div class="progress-bar-inner" style="width:${data.profitTargetProgressPercent}%"></div>
    <div class="hud-profit-progress-ytd cash">${util.formatCurrency(Math.floor(data.ytdProfit))}</div>
    <div class="hud-profit-progress-target cash">${util.formatCurrency(data.profitTarget)}</div>
  </div>
</div>
`;


const cashTemplate = data => `
<h2 class="cash">${util.formatCurrency(Math.floor(data.cash))}</h2>
`;



class HUD extends View {
  constructor(player) {
    super({
      parent: '.hud',
      template: template
    });
    this.player = player;
    this.registerHandlers({
      '.start-new-task': function() {
        var view = new NewTaskView(player);
        view.render();
      }
    });
  }

  render() {
    super.render(this.player.snapshot);
  }

  postRender() {
    super.postRender();
    var data = this.player.snapshot;
    if (!this.subviews) {
      this.productDevView = new View({
        parent: '.hud-product-dev',
        template: productDevTemplate
      });
      this.promoDevView = new View({
        parent: '.hud-promo-dev',
        template: promoDevTemplate
      });
      this.statsView = new View({
        parent: '.hud-stats',
        template: statsTemplate
      });
      this.subviews = [
        new View({
          parent: '.hud-date',
          template: timeTemplate
        }),
        new View({
          parent: '.hud-center',
          template: boardTemplate
        }),
        new View({
          parent: '.hud-cash',
          template: cashTemplate
        }),
        new View({
          parent: '.hud-active-products',
          template: activeProductTemplate
        })
      ];
    }
    _.each(this.subviews, view => view.render(data));
    this.statsView.render(data);
    this.productDevView.render(data);
    this.promoDevView.render(data);
  }

  update() {
    var data = this.player.snapshot;
    _.each(this.subviews, view => view.render(data));
    if (this.player.company.product) {
      this.productDevView.render(data);
    }
    if (this.player.company.promo) {
      this.promoDevView.render(data);
    }
    this.statsView.el.find('.hype-val').text(util.abbreviateNumber(data.hype, 0));
  }
}

export default HUD;
