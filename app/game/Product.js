import _ from 'underscore';
import productRecipes from 'data/productRecipes.json';

const PROGRESS_PER_DIFFICULTY = 100;
const MAIN_FEATURE_SCALE = 0.1;
const PRODUCT_FEATURES = [null, 'design', 'engineering', 'marketing'];
const REVENUE_DECAY = 0.8;
const NEW_PRODUCT_MULTIPLIER = 1.5;


function requiredProgress(difficulty) {
  return Math.exp(difficulty/10) * PROGRESS_PER_DIFFICULTY
}

function targetValue(difficulty) {
  return Math.exp(difficulty/10);
}

function marketShareToRevenue(incomeLevel) {
  return Math.pow((incomeLevel + 1), 2) * 1000;
}

const Product = {
  create: function(productTypes, company) {
    var recipeName = _.map(
      _.sortBy(productTypes, function(pt) { return pt.name }),
      function(pt) {return pt.name}).join('.');
    var recipe = _.findWhere(productRecipes, {name: recipeName});
    if (recipe === undefined) {
      recipe = _.findWhere(productRecipes, {name: 'Default'});
    }
    var difficulty = _.reduce(productTypes, function(mem, pt) {
      return mem + pt.difficulty;
    }, 0);

    return {
      name: _.sample(recipe.names),
      recipeName: recipe.name,
      difficulty: difficulty,
      killsPeople: _.contains(recipe.productTypes, 'Defense'),
      debtsPeople: _.contains(recipe.productTypes, 'Credit'),
      pollutes: _.intersection(recipe.productTypes, ['Gadget', 'Implant', 'Mobile', 'Wearable', 'Robot', 'Defense']).length > 0,
      productTypes: _.pluck(productTypes, 'name'),
      verticals: _.uniq(_.pluck(productTypes, 'requiredVertical')),
      effects: recipe.effects,
      marketing: 0,
      engineering: 0,
      design: 0,
      feature: PRODUCT_FEATURES[recipe.feature],
      owner: company,
      description: recipe.description,
      combo: _.pluck(productTypes, 'name').join(' + '),
      progress: 0,
      requiredProgress: requiredProgress(difficulty)
    };
  },

  launch: function(p, company) {
    p.levels = {
      quantity: 0,
      strength: 0,
      movement: 0
    };
    if (this.onProductLaunch) {
      this.onProductLaunch(p);
    }

    return p;
  },

  createCompetitorProduct: function(p, company) {
    var p = _.clone(p);
    _.each(['design', 'engineering', 'marketing'], function(name) {
      p[name] *= company.skills[name];
    });
    // TODO generate dynamically depending on competitor
    p.levels = {
      quantity: 2,
      strength: 2,
      movement: 2
    };
    return p;
  },

  setRevenue: function(p, marketShares, influencers, player) {
    var hypeMultiplier = (1+player.company.hype/1000),
        influencerMultiplier = 1 + (influencers.length*0.5),
        newDiscoveryMuliplier = p.newDiscovery ? NEW_PRODUCT_MULTIPLIER : 1;
    p.earnedRevenue = 0;
    p.revenue = _.reduce(marketShares, function(m,w) {
      return m + (marketShareToRevenue(w.income) * p.difficulty);
    }, 0) * player.spendingMultiplier * hypeMultiplier * influencerMultiplier * newDiscoveryMuliplier;
    return {
      revenue: p.revenue,
      spendingMultiplier: player.spendingMultiplier,
      hypeMultiplier: hypeMultiplier,
      influencerMultiplier: influencerMultiplier,
      newDiscoveryMuliplier: newDiscoveryMuliplier
    }
  },

  getRevenue: function(p) {
    var range = p.revenue * 0.1,
        revenue = Math.max(0, _.random(p.revenue - range, p.revenue + range));
    p.revenue *= REVENUE_DECAY;
    p.earnedRevenue += revenue;
    return revenue;
  },

  // for designing products
  // TODO these values will need balancing
  // maybe should depend on the other levels?
  costs: {
    quantity: function(product) {
      return Math.round(Math.pow(product.levels.quantity+1, 2) * Math.sqrt(product.difficulty));
    },
    strength: function(product) {
      return Math.round(Math.pow(product.levels.strength+1, 2) * Math.sqrt(product.difficulty));
    },
    movement: function(product) {
      return Math.round(Math.pow(product.levels.movement+1, 2) * Math.sqrt(product.difficulty));
    }
  },
  levels: {
    quantity: _.map(_.range(1,11), i => [i,i+1]),
    strength: _.map(_.range(1,11), i => [i,i+1]),
    movement: _.map(_.range(1,11), i => [i,i+1])
  },
  requiredSkills: {
    quantity: ['engineering', 'marketing'],
    strength: ['engineering', 'design'],
    movement: ['marketing', 'design']
  },
  samplePoint: function(name, product) {
    var range = this.levels[name][product.levels[name]];
    return _.random(range[0], range[1]);
  }
};

export default Product;
