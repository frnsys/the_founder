import _ from 'underscore';
import Product from './Product';

const qualities = ['quantity', 'strength', 'movement'];

function available(name, product) {
  var cost = Product.costs[name](product);
  return product.levels[name] < 10 && _.every(Product.requiredSkills[name], s => product[s] >= cost);
}

const Competitor = {
  createProduct: function(product, competitor) {
    // create a competitor version of a player's product
    var p = _.clone(product);
    _.each(['design', 'engineering', 'marketing'], function(name) {
      p[name] *= competitor.skills[name];
    });
    return this.designProduct(p, competitor);
  },

  designProduct: function(product, competitor) {
    // greedily assign product levels
    product.levels = {
      quantity: 0,
      strength: 0,
      movement: 0
    };
    var options = _.filter(qualities, q => available(q, product));
    while (options.length > 0) {
      var quality = _.sample(options);
      product.levels[quality]++;
      options = _.filter(qualities, q => available(q, product));
    }
    return product;
  }
}

export default Competitor;
