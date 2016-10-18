import $ from 'jquery';
import _ from 'underscore';
import util from 'util';
import templ from './Common';
import View from 'views/View';
import Popup from 'views/Popup';
import Tile from 'market/Tile';
import Board from 'market/Board';
import Product from 'game/Product';
import Competitor from 'game/Competitor';
import MarketReport from 'views/alerts/MarketReport';

const competitorDifficulty = [
  'Easy',
  'Moderate',
  'Hard',
  'Very Hard'
];

function newDiscovery(data) {
  if (data.newDiscovery) {
    return `
      <h4 class="product-new-discovery">Innovative!</h4>
      <div class="product-new-effects">
        ${data.effects.length > 0 ? `This freshly innovated product gives the following bonuses:<br>${templ.effects(data)}` : ''}
      </div>
    `;
  }
  return '';
}

const tooltips = {
  'quantity': 'How many products are in the Market.',
  'movement': 'How many moves each product has.',
  'strength': 'How much health each product has.'
};

const productPoints = (name, data) => `
  <li>
    <h2 data-tip="${tooltips[name]}">${name.charAt(0).toUpperCase() + name.slice(1)}</h2>
    <ul class="product-points">
      ${_.times(data.levels[name]+1, i => `
        <li class="product-point filled"></li>
      `).join('')}
      ${_.times(10-(data.levels[name]+1), i => `
        <li class="product-point"></li>
      `).join('')}
    </ul>
    <span class="quantity-stat">${Product.levels[name][data.levels[name]]}</span>
    <div class="product-pointer-control">
      <button data-name="${name}" class="product-point-sub" ${data.levels[name] == 0 ? 'disabled' : ''}>-</button>
      <button data-name="${name}" class="product-point-add ${data.levels[name] >= 10 || !data.afford[name] ? 'disabled' : ''}" data-tip="Next level: ${data.costs[name]} ${Product.requiredSkills[name].join(' & ')}">+</button>
    </div>
  </li>
`;

const template = data => `
<div class="product-revenue-per-share">
  Revenue per market share: ${util.formatCurrency(data.revenuePerShare)}
</div>
<div class="product-designer-view">
  <div class="title">
    <h1>${data.name}</h1>
    <h3 class="subtitle">${data.combo}</h3>
  </div>
  <div class="product-designer-combo">
    ${data.productTypes.map(pt => `
      <img src="assets/productTypes/${util.slugify(pt)}.gif">
    `).join('')}
  </div>
  ${newDiscovery(data)}
  <ul class="product-skills">
    <li>Product points</li>
    <li data-tip="Design (spent on Strength and Movement)"><img src="assets/company/design.png"> <span class="design-stat">${Math.floor(data.design)}</span></li>
    <li data-tip="Marketing (spent on Quantity and Movement)"><img src="assets/company/marketing.png"> <span class="marketing-stat">${Math.floor(data.marketing)}</span></li>
    <li data-tip="Engineering (spent on Quantity and Strength)"><img src="assets/company/engineering.png"> <span class="engineering-stat">${Math.floor(data.engineering)}</span></li>
  </ul>
  <ul class="product-point-allocator">
    ${productPoints('quantity', data)}
    ${productPoints('strength', data)}
    ${productPoints('movement', data)}
  </ul>
  <div class="actions">
    <button class="launch-product">Launch</button>
  </div>
</div>
<div class="product-competitor ${data.competitor.name == 'Dark Industries' ? 'dark_industries' : ''}">
  <h6>Your Competition</h6>
  <div class="product-competitor-difficulty" data-tip="Difficulty">${competitorDifficulty[data.competitor.difficulty]}</div>
  <figure>
    <img src="assets/competitors/${util.slugify(data.competitor.name)}.svg">
  </figure>
  <div class="product-competitor-detail">
    <h2>${data.competitor.name}</h2>
    <h5>CEO: <span class="product-competitor-ceo">${data.competitor.founder}</span></h5>
    <p>${data.competitor.description}</p>
  </div>
</div>
${data.productsLaunched > 8 ? `<div class="skip-market">Have an employee do it. (expected market share: ${(data.expectedMarketShare * 100).toFixed(0)}%)</div>` : ''}
`;

class ProductDesigner extends Popup {
  constructor(product, competitor, player) {
    super({
      title: 'Product Designer',
      template: template
    });
    this.player = player;
    this.product = product;
    this.competitor = competitor;

    var competitorProduct = Competitor.createProduct(product, competitor);
    this.expectedMarketShare = _.reduce(['design', 'engineering', 'marketing'], (m, s) => {
      return m + (product[s]/(product[s] + competitorProduct[s]));
    }, 0);
    this.expectedMarketShare /= 3;


    var _postRemove = super.postRemove;
    this.registerHandlers({
      '.product-point-add': function(ev) {
        var name = $(ev.target).data('name'),
            cost = Product.costs[name](this.product);
        if (this.canAfford(name, cost)) {
          _.each(Product.requiredSkills[name], s => this.product[s] -= cost);
          this.product.levels[name]++;
        }
        this.render();
      },
      '.product-point-sub': function(ev) {
        var name = $(ev.target).data('name'),
            cost;
        this.product.levels[name]--;
        cost = Product.costs[name](this.product);
        _.each(Product.requiredSkills[name], s => this.product[s] += cost);
        this.render();
      },
      '.launch-product': function() {
        // the Manage state hooks into this view's
        // postRemove method to setup the Market
        this.remove();
      },
      '.skip-market': function() {
        // whooooaaa
        var nTiles = Board.nTiles(this.player.company),
            tiles = _.map(_.range(nTiles), () => Tile.random()),
            incomeTiles = _.filter(tiles, t => t instanceof Tile.Income),
            influencerTiles = _.filter(tiles, t => t instanceof Tile.Influencer),
            influencers = _.random(0, influencerTiles.length),
            totalIncome = _.reduce(incomeTiles, (m, t) => m + t.income + 1, 0),
            playerMarketShare = Math.min(_.random(
              this.expectedMarketShare * 0.9 * 100,
              this.expectedMarketShare * 1.1 * 100), 100)/100,
            playerIncome = Math.round(playerMarketShare * totalIncome),
            marketShares = _.map(_.range(playerIncome), () => ({income: 0})), // spoof income tiles
            results = Product.setRevenue(this.product, marketShares, influencers, this.player);

        results.marketShare = (playerIncome/totalIncome) * 100;
        this.player.company.finishProduct(this.product);

        // overwrite the postRemove the Manage state set
        this.postRemove = () => {
          _postRemove();
          var report = new MarketReport();
          report.render(results);
          this.player.save();
        };
        this.remove();
      }
    });
  }

  canAfford(name, cost) {
    return _.every(Product.requiredSkills[name], s => this.product[s] >= cost);
  }

  render() {
    var self = this;
    super.render(_.extend({
      costs: {
        quantity: Product.costs.quantity(this.product),
        strength: Product.costs.strength(this.product),
        movement: Product.costs.movement(this.product)
      },
      afford: _.reduce(['quantity', 'strength', 'movement'], function(o, n) {
        o[n] = self.canAfford(n, Product.costs[n](self.product));
        return o;
      }, {}),
      revenuePerShare: Product.marketShareToRevenue(0, this.product, this.player),
      competitor: this.competitor,
      productsLaunched: this.player.company.productsLaunched,
      expectedMarketShare: this.expectedMarketShare
    }, this.product));
    // hack to hide tooltips after re-render
    // otherwise they hang around b/c the element
    // that triggered them disappears
    $('.tooltip').hide();
  }
}

export default ProductDesigner;
