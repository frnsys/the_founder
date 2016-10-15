import Competitor from 'game/Competitor';

describe('Competitor', function() {
  var product, competitor;
  beforeEach(function() {
    product = {
      design: 10,
      engineering: 10,
      marketing: 10,
      difficulty: 1
    };
    competitor = {
      skills: {
        design: 1.1,
        engineering: 1.1,
        marketing: 0.8
      },
      difficulty: 0
    };
  });


  it('creates a product', function() {
    var p = Competitor.createProduct(product, competitor);
    expect(p.design).toBeGreaterThan(10);
    expect(p.engineering).toBeGreaterThan(10);
    expect(p.marketing).toBeLessThan(10);

    expect(p.levels.quantity).toBeGreaterThan(0);
    expect(p.levels.strength).toBeGreaterThan(0);
    expect(p.levels.movement).toBeGreaterThan(0);
  });
});
