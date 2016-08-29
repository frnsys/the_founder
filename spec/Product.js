import _ from 'underscore';
import Player from 'app/Player';
import Product from 'game/Product';

var goodCombo = [{
  "name": "Ad",
  "difficulty": 1,
  "requiredVertical": "Information",
  "cost": 10000
}, {
  "name": "Analytics",
  "difficulty": 1,
  "requiredVertical": "Information",
  "cost": 10000
}];
var badCombo = [{
  "name": "Ad",
  "difficulty": 1,
  "requiredVertical": "Information",
  "cost": 10000
}, {
  "name": "AI",
  "difficulty": 3,
  "requiredVertical": "Information",
  "cost": 100000
}];
var competitor = {
  "skills": {
    "design": 1.1,
    "marketing": 1.3,
    "engineering": 0.8
  }
};


describe('Product', function() {
  var player, company, createProduct,
      worker = {
        "design": 10,
        "marketing": 10,
        "engineering": 10,
        "productivity": 50,
        "attributes": []
      };
  beforeEach(function() {
    player = new Player();
    company = player.company;
    company.workers.push(worker);

    createProduct = function() {
      var task = company.startProduct(goodCombo);
      var product = task.obj;
      company.workers[0].productivity = product.requiredProgress;
      company.startTask(task, company.workers, []);
      company.develop();
      return product;
    };
  });

  describe('creation', function() {
    it('is created from two product types (good combo)', function() {
      var product = Product.create(goodCombo, company);
      expect(product.recipeName).toEqual('Ad.Analytics');
    });

    it('is created from two product types (bad combo)', function() {
      var product = Product.create(badCombo, company);
      expect(product.recipeName).toEqual('Default');
    });

    it('has a name if a good combo', function() {
      var product = Product.create(goodCombo, company);
      expect(product.name).not.toEqual('Junk');
    });

    it('has difficulty aggregate of its product types', function() {
      var product = Product.create(goodCombo, company);
      expect(product.difficulty).toEqual(2);
    });

    it('has required progress based on difficulty', function() {
      var product1 = Product.create(goodCombo, company);
      goodCombo[0].difficulty = 5;
      var product2 = Product.create(goodCombo, company);
      expect(product2.requiredProgress).toBeGreaterThan(product1.requiredProgress);
    });
  });

  describe('development', function() {
    it('can be started', function() {
      expect(company.tasks.length).toEqual(0);
      var task = company.startProduct(goodCombo);
      company.startTask(task, company.workers, []);
      expect(company.tasks.length).toEqual(1);
      expect(company.tasks[0].obj.recipeName).toEqual('Ad.Analytics');
      expect(company.workers[0].task).toEqual(company.tasks[0].id);
    });

    it('is developed with productivity and skills', function() {
      var task = company.startProduct(goodCombo);
      company.startTask(task, company.workers, []);
      var product = task.obj;
      expect(task.progress).toEqual(0);
      expect(product.design).toEqual(0);
      expect(product.marketing).toEqual(0);
      expect(product.engineering).toEqual(0);

      company.develop();

      expect(task.progress).toBeGreaterThan(0);
      expect(product.design).toBeGreaterThan(0);
      expect(product.marketing).toBeGreaterThan(0);
      expect(product.engineering).toBeGreaterThan(0);
    });
  });

  describe('launch', function() {
    it('is added to discovered products', function() {
      createProduct();
      expect(company.discoveredProducts).toEqual(['Ad.Analytics']);
    });

    it('applies effects (only) on discovery', function() {
      expect(player.spendingMultiplier).toEqual(1);

      createProduct();
      var val = player.spendingMultiplier;
      expect(val).toBeGreaterThan(1);

      createProduct();
      expect(player.spendingMultiplier).toEqual(val);
    });
  });

  describe('revenue', function() {
    it('is based on market shares captured', function() {
      var p = createProduct(),
          marketShares = [{income: 1}, {income: 2}],
          influencers = [];
      expect(p.revenue).toBe(undefined);
      Product.setRevenue(p, marketShares, influencers, player);
      expect(p.revenue).not.toBe(undefined);
    });

    it('is affected by product difficulty', function() {
      var p = createProduct(),
          marketShares = [{income: 1}, {income: 2}],
          influencers = [];
      p.difficulty = 1;
      Product.setRevenue(p, marketShares, influencers, player);
      var val = p.revenue;

      p = createProduct();
      p.difficulty = 2;
      Product.setRevenue(p, marketShares, influencers, player);
      expect(p.revenue).toBeGreaterThan(val);
    });

    it('is affected by spending multiplier', function() {
      var p = createProduct(),
          marketShares = [{income: 1}, {income: 2}],
          influencers = [];
      player.spendingMultiplier = 1;
      Product.setRevenue(p, marketShares, influencers, player);
      var val = p.revenue;

      p = createProduct();
      player.spendingMultiplier = 2;
      Product.setRevenue(p, marketShares, influencers, player);
      expect(p.revenue).toBeGreaterThan(val);
    });

    it('is affected by company hype', function() {
      var p = createProduct(),
          marketShares = [{income: 1}, {income: 2}],
          influencers = [];
      player.company.hype = 2;
      Product.setRevenue(p, marketShares, influencers, player);
      var val = p.revenue;

      p = createProduct();
      player.spendingMultiplier = 2;
      Product.setRevenue(p, marketShares, influencers, player);
      expect(p.revenue).toBeGreaterThan(val);
    });

    it('is affected by influencers', function() {
      var p = createProduct(),
          marketShares = [{income: 1}, {income: 2}],
          influencers = [];
      player.company.hype = 2;
      Product.setRevenue(p, marketShares, influencers, player);
      var val = p.revenue;

      p = createProduct();
      influencers = [{}, {}];
      Product.setRevenue(p, marketShares, influencers, player);
      expect(p.revenue).toBeGreaterThan(val);
    });

    it('decays over time', function() {
      var p = createProduct(),
          marketShares = [{income: 1}, {income: 2}],
          influencers = [];
      Product.setRevenue(p, marketShares, influencers, player);
      var val = p.revenue;
      Product.getRevenue(p);
      expect(p.revenue).toBeLessThan(val);
    });
  });

  describe('skills', function() {
    it('should be more costly at higher levels', function() {
      _.each(['quantity', 'strength', 'movement'], function(n) {
        var p = createProduct(),
            cost;
        p.levels[n] = 0;
        cost = Product.costs[n](p);
        expect(cost).toBeGreaterThan(0);

        p.levels[n] = 1;
        expect(Product.costs[n](p)).toBeGreaterThan(cost);
      });
    });
  });
});


