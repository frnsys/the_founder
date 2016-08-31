import _ from 'underscore';
import Piece from 'market/Piece';
import Player from 'market/Player';

describe('Piece', function() {
  var player, product, piece, strength, movement;
  beforeEach(function() {
    strength = 10;
    movement = 2;
    player = new Player({}, true, 0x8888ff);
    product = {
      name: 'bloop'
    };
    piece = new Piece.Product(player, product, strength, movement);

    // mock
    piece.sprite = {destroy: _.noop};
  });

  it('is added to owner\'s pieces', function() {
    expect(player.pieces).toEqual([piece]);
  });

  it('can be exhausted and reset', function() {
    expect(piece.moves).toEqual(movement);
    piece.exhaust();
    expect(piece.moves).toEqual(0);

    piece.reset();
    expect(piece.moves).toEqual(movement);
  });

  it('has power is a function of health', function() {
    var power = piece.power;
    piece.health -= 2;
    expect(piece.power).toBeLessThan(power);
  });

  describe('combat', function() {
    var tile;
    beforeEach(function() {
      // mock tile
      tile = {piece: piece};
      piece.tile = tile;

      // mock sprite text
      piece.text = {text:''}
    });

    it('can be destroyed', function() {
      piece.destroy();
      expect(player.pieces.length).toEqual(0);
      expect(tile.piece).toEqual(null);
    });

    it('can attack other pieces', function() {
      var enemyStrength = 15,
          enemy = new Player({}, false, 0x000000),
          other = new Piece.Product(enemy, product, enemyStrength, 1);

      // mocks
      other.text = {text:''}

      piece.attack(other);
      expect(other.health).toBeLessThan(other.maxHealth);
      expect(piece.health).toBeLessThan(piece.maxHealth);

      // should be exhausted
      expect(piece.moves).toEqual(0);
    });

    it('cannot defend if it dies during attack', function() {
      var enemyStrength = 1,
          enemy = new Player({}, false, 0x000000),
          other = new Piece.Product(enemy, product, enemyStrength, 1);

      // mocks
      var enemyTile = {piece: other};
      other.tile = enemyTile;
      other.sprite = {destroy: _.noop};

      piece.attack(other);
      expect(other.health).toBeLessThan(0);
      expect(piece.health).toEqual(piece.maxHealth);
    });
  });

});
