/*
 * Product
 * - created by combining two product types
 * - some product types combinations correspond to "recipes"; (successes) others are failures
 * - some recipes have effects which occur upon first discovery
 * - are developed as a Product Task
 * - periodically generate revenue
 *   - revenue decays over time
 *   - revenue generated depends on
 *     - market share captured
 *     - influencers captured
 *     - product difficulty
 *     - hype
 *     - consumer spending multiplier
 *     - the economy
 *     - if the product is a new discovery
 * - are allocated levels to Market qualities (quantity, strength, movement)
 *   - each requires points from a particular skill (design, engineering, marketing)
 *   - each requires more points as levels increase (nonlinear)
 */

import _ from 'underscore';
import config from 'config';
import Economy from './Economy';
import productRecipes from 'data/productRecipes.json';

const PRODUCT_FEATURES = [null, 'design', 'engineering', 'marketing'];

function requiredProgress(difficulty) {
  return Math.exp(difficulty/10) * config.PROGRESS_PER_DIFFICULTY
}

const Product = {
  initType: function(pt) {
    return _.extend({
      expertise: 0
    }, pt);
  },

  create: function(productTypes) {
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

    var revenueScore = _.reduce(productTypes, function(mem, pt) {
      return mem + (pt.difficulty * (pt.expertise + 1));
    }, 0);

    return {
      name: recipe.productName,
      recipeName: recipe.name,
      difficulty: difficulty,
      revenueScore: revenueScore,
      killsPeople: _.contains(recipe.productTypes, 'Defense'),
      debtsPeople: _.contains(recipe.productTypes, 'Credit'),
      pollutes: _.intersection(recipe.productTypes, ['Gadget', 'Implant', 'Mobile', 'Wearable', 'Robot', 'Defense', 'E-Commerce', 'Logistics', 'Social Network', 'Space']).length > 0,
      moralPanic: _.intersection(recipe.productTypes, ['Drug', 'Genetics', 'Synthetic Organism', 'Cognitive', 'Celebrity', 'Entertainment']).length > 0,
      productTypes: _.pluck(productTypes, 'name'),
      verticals: _.uniq(_.pluck(productTypes, 'requiredVertical')),
      effects: recipe.effects,
      marketing: 0,
      engineering: 0,
      design: 0,
      feature: PRODUCT_FEATURES[recipe.feature],
      description: recipe.description,
      combo: _.pluck(productTypes, 'name').join(' + '),
      progress: 0,
      requiredProgress: requiredProgress(difficulty)
    };
  },

  launch: function(p, company) {
    p.levels = {
      quantity: Math.min(_.reduce(p.verticals, (m,v) => m + company.getProductBonus('quantity', v), 0), 10),
      strength: Math.min(_.reduce(p.verticals, (m,v) => m + company.getProductBonus('strength', v), 0), 10),
      movement: Math.min(_.reduce(p.verticals, (m,v) => m + company.getProductBonus('movement', v), 0), 10)
    };

    if (p.recipeName != 'Default') {
      // add expertise points
      _.each(company.productTypes, function(pt) {
        if (_.contains(p.productTypes, pt.name)) {
          pt.expertise = Math.min(pt.expertise+1, 11);
        }
      });
    }

    if (this.onProductLaunch) {
      this.onProductLaunch(p);
    }

    return p;
  },

  // revenue management
  setRevenue: function(p, marketShares, influencers, player) {
    var hypeMultiplier = 1 + Math.max(0, Math.sqrt(player.company.hype) * config.HYPE_SCALE),
        influencerMultiplier = 1 + (influencers*0.5),
        newDiscoveryMuliplier = p.newDiscovery ? config.NEW_PRODUCT_MULTIPLIER : 1,
        economyMultiplier = Economy.multiplier(player.economy);
    p.earnedRevenue = 0;
    var baseRevenue = _.reduce(marketShares, function(m,w) {
      return m + Product.marketShareToRevenue(w.income, p, player);
    }, 0)
    p.revenue = baseRevenue * player.spendingMultiplier * hypeMultiplier * influencerMultiplier * newDiscoveryMuliplier * economyMultiplier;
    return {
      baseRevenue: baseRevenue,
      revenue: p.revenue,
      spendingMultiplier: player.spendingMultiplier,
      hypeMultiplier: hypeMultiplier,
      influencerMultiplier: influencerMultiplier,
      newDiscoveryMuliplier: newDiscoveryMuliplier,
      economyMultiplier: economyMultiplier
    }
  },
  getRevenue: function(p) {
    var range = p.revenue * 0.1,
        revenue = Math.max(0, _.random(p.revenue - range, p.revenue + range))/config.REVENUE_WEEK_SCALE;
    p.revenue *= config.REVENUE_DECAY;
    p.earnedRevenue += revenue;
    return revenue;
  },
  marketShareToRevenue: function(incomeLevel, product, player) {
    return Math.pow((incomeLevel + 1), 2) * (config.BASE_REVENUE_PER_SHARE + player.revenuePerMarketShareBonus) * product.revenueScore;
  },

  // for the product designer
  // some notes:
  // - the easiest product will have a difficulty of 2 (b/c min difficulty of a type is 1)
  // - the hardest product will have a difficulty of 10 (b/c max difficulty of a type is 5)
  costs: {
    quantity: function(product) {
      return 5 * Math.pow(product.difficulty, 2) * Math.pow(3, product.levels.quantity);
    },
    strength: function(product) {
      return 1 * Math.pow(product.difficulty, 2) * Math.pow(3, product.levels.strength);
    },
    movement: function(product) {
      return 3 * Math.pow(product.difficulty, 2) * Math.pow(3, product.levels.movement);
    }
  },
  levels: {
    quantity: _.range(1,11),
    strength: _.range(1,11),
    movement: _.range(1,11)
  },
  requiredSkills: {
    quantity: ['engineering', 'marketing'],
    strength: ['engineering', 'design'],
    movement: ['marketing', 'design']
  }
};

export default Product;
