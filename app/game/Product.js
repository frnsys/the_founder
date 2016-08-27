import _ from 'underscore';
import productRecipes from 'data/productRecipes.json';

const PROGRESS_PER_DIFFICULTY = 100;
const MAIN_FEATURE_SCALE = 0.1;
const PRODUCT_FEATURES = [null, 'design', 'engineering', 'marketing'];
const REVENUE_DECAY = 0.8;

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
      pollutes: _.intersection(recipe.productTypes, ['Gadget', 'Implant', 'Mobile', 'Wearable', 'Android', 'Defense']).length > 0,
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
    var skill = p.feature != null ? p[p.feature] : 0;
    skill *= MAIN_FEATURE_SCALE;

    _.each([['health', 'engineering'],
            ['movement', 'design'],
            ['strength', 'marketing']], function(v) {
      p[v[0]] = (p[v[1]]+ skill + company.getProductBonus(v[1], p.vertical))/targetValue(p.difficulty);
    });
    p.quantity = Math.round(Math.sqrt(company.hype));

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
    return p;
  },

  setRevenue: function(p, marketShares, influencers, player) {
    var hypeMultiplier = (1+player.company.hype/1000),
        influencerMultiplier = 1 + (influencers.length*0.5);
    p.earnedRevenue = 0;
    p.revenue = _.reduce(marketShares, function(m,w) {
      return m + marketShareToRevenue(w.income);
    }, 0) * player.spendingMultiplier * hypeMultiplier * influencerMultiplier;
    return {
      revenue: p.revenue,
      spendingMultiplier: player.spendingMultiplier,
      hypeMultiplier: hypeMultiplier,
      influencerMultiplier: influencerMultiplier
    }
  },

  getRevenue: function(p) {
    var range = p.revenue * 0.1,
        revenue = Math.max(0, _.random(p.revenue - range, p.revenue + range));
    p.revenue *= REVENUE_DECAY;
    p.earnedRevenue += revenue;
    return revenue;
  }
};

export default Product;
