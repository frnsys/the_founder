import _ from 'underscore';
import Player from 'app/Player';

describe('Product Type', function() {
  var player, company, productType;
  beforeEach(function() {
    player = new Player({}, {cash:10000});
    company = player.company;
    productType = {
      "name": "Ad",
      "difficulty": 1,
      "requiredVertical": "Information",
      "cost": 10000
    };
  });

  describe('when bought', function() {
    it('requires a vertical', function() {
      expect(company.buyProductType(productType)).toEqual(false);
      company.verticals = [{name: 'Information'}];
      expect(company.buyProductType(productType)).toEqual(true);
    });

    it('saves the product type', function() {
      expect(company.productTypes.length).toEqual(0);
      company.verticals = [{name: 'Information'}];
      company.buyProductType(productType);
      expect(company.productTypes.length).toEqual(1);
      expect(company.productTypes[0].name).toEqual('Ad');
    });
  });
});


