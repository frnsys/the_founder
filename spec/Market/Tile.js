import Tile from 'market/Tile';
import Piece from 'market/Piece';
import Player from 'market/Player';

describe('Tile', function() {
  var tile, player, product, piece, strength;
  beforeEach(function() {
    player = new Player({}, true, 0x8888ff);
    product = {
      name: 'bloop'
    };
    tile = new Tile.Income();
    strength = tile.baseCost - 1;
    piece = new Piece.Product(player, product, strength, 2);

    // mocks
    tile.sprite = {tint:''}
    tile.text = {text:''}
    piece.sprite = {tint:''};
  });

  it('should gain captured cost when capturing', function() {
    expect(tile.owner).toBeUndefined();
    expect(tile.capturedCost).toEqual(0);
    tile.capture(piece);
    expect(tile.capturedCost).toEqual(strength);
    expect(tile.owner).toBeUndefined();

    // piece should be exhausted
    expect(piece.moves).toEqual(0);
  });

  it('should be captured according to piece health', function() {
    expect(tile.owner).toBeUndefined();
    expect(tile.capturedCost).toEqual(0);
    piece.health -= 2;
    tile.capture(piece);
    expect(tile.capturedCost).toEqual(strength-2);
    expect(tile.owner).toBeUndefined();
  });

  it('should be captured with enough capture cost', function() {
    expect(tile.owner).toBeUndefined();
    piece.health = tile.baseCost;
    tile.capture(piece);

    expect(tile.owner).toEqual(player);
    expect(player.tiles).toEqual([tile]);

    // capture cost should reset
    expect(tile.capturedCost).toEqual(0);
  });

  it('can be captured from another player', function() {
    var enemy = new Player({}, false, 0x000000);
    tile.owner = enemy;
    enemy.tiles = [tile];
    piece.health = tile.baseCost;
    tile.capture(piece);

    expect(tile.owner).toEqual(player);
    expect(player.tiles).toEqual([tile]);
    expect(enemy.tiles).toEqual([]);
  });
});
