import _ from 'underscore';
import Player from 'app/Player';
import Effect from 'game/Effect';

describe('Effect', function() {
  var player;
  beforeEach(function() {
    player = new Player();
  });

  it('affects cash', function() {
    var effect = {
      type: 'cash',
      value: 1000
    }
    player.company.cash = 0;
    Effect.apply(effect, player);
    expect(player.company.cash).toEqual(1000);
    Effect.remove(effect, player);
    expect(player.company.cash).toEqual(0);
  });

  // all multiplier effects are similar
  _.each([
    'forgettingRate', 'spendingMultiplier',
    'wageMultiplier', 'economicStability',
    'taxRate', 'expansionCostMultiplier',
    'costMultiplier'], function(name) {
    it('affects ' + name, function() {
      var effect = {
        type: name,
        value: 0.1
      };
      player[name] = 1;
      Effect.apply(effect, player);
      expect(player[name]).toEqual(1.1);
      Effect.remove(effect, player);
      expect(player[name]).toEqual(1);
    });
  });

  // all worker effects are similar
  _.each([
    'productivity', 'happiness',
    'design', 'engineering', 'marketing'], function(name) {
    it('affects ' + name, function() {
      var effect = {
        type: name,
        value: 1
      };
      expect(player.company[name]).toEqual(1);
      Effect.apply(effect, player);
      expect(player.company[name]).toEqual(2);
      Effect.remove(effect, player);
      expect(player.company[name]).toEqual(1);
    });
  });

  // all special effects are similar
  _.each([
    'Immortal', 'Cloneable', 'Prescient',
    'Worker Insight', 'Worker Quant',
    'The Founder AI', 'Automation'], function(name) {
    it('affects ' + name, function() {
      var effect = {
        type: 'specialEffect',
        value: name
      };
      // should be initialized to false
      expect(player.specialEffects[name]).toEqual(false);
      Effect.apply(effect, player);
      expect(player.specialEffects[name]).toEqual(true);
      Effect.remove(effect, player);
      expect(player.specialEffects[name]).toEqual(false);
    });
  });

  _.each(['design', 'marketing', 'engineering'], function(name) {
    if('affects ' + name, function() {
      var effect = {
        type: 'product',
        value: {
          vertical: 'Hardware',
          attribute: name,
          value: 1
        }
      };
      expect(player.company.getProductBonus(name, 'Hardware')).toEqual(0);
      Effect.apply(effect, player);
      expect(player.company.getProductBonus(name, 'Hardware')).toEqual(1);
      Effect.remove(effect, player);
      expect(player.company.getProductBonus(name, 'Hardware')).toEqual(0);
    });
  });
});


