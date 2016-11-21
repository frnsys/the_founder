/*
 * Piece
 * - the combat units in the Market
 * - can capture tiles
 * - can attack other pieces
 * - have limited number of moves per turn
 * - have strength/health
 * - belong to a particular player
 */

import $ from 'jquery';
import _ from 'underscore';
import Product from 'game/Product';

// http://stackoverflow.com/a/13542669/1097920
function shadeColor(color, percent) {
    var f=color,t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return 0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B);
}

class Piece {
  constructor(player) {
    this.owner = player;
    player.pieces.push(this);
  }

  attack(other) {
    var atk = this.power,
        def;

    // attacker has the initiative
    other.damage(atk);

    // defender must still be alive to fight back
    if (other.health > 0) {
      def = other.power;
      this.damage(def);
    }
    this.exhaust();

    // return damage dealt by attacker and defender
    return {
      attacker: atk,
      defender: def
    }
  }

  get power() {
    // sometimes there is random bonus damage
    var bonus = Math.random() <= 0.05 ? 1 : 0;
    return Math.max(Math.floor(this.health/2 + bonus), 1);
  }

  damage(damage) {
    this.health -= damage;
    if (this.health <= 0) {
      this.destroy();
    } else {
      this.text.text = this.health.toString();
    }
  }

  destroy() {
    this.tile.piece = null;
    this.owner.pieces = _.without(this.owner.pieces, this);
    this.sprite.destroy();
  }

  exhaust() {
    this.moves = 0;
    this.sprite.tint = shadeColor(this.owner.color, 0.5);

    if (this.tile.owner === this.owner && this.flag) {
      this.flag.destroy();
    }
  }

  reset() {
    this.moves = this.movement;
    this.sprite.tint = this.owner.color;
  }

  render(coord, group, game, tileHeight, tileWidth, board) {
    if (_.isUndefined(this.sprite)) {
      var self = this;
      this.sprite = group.create(coord.x, coord.y, this.spriteName);
      if (this.owner.human) {
        this.sprite.inputEnabled = true;
        this.sprite.input.enableDrag();
        this.sprite.events.onDragStart.add(function(sprite, pointer) {
          board.onDragStartPiece(self, pointer);
        }, board);
        this.sprite.events.onDragStop.add(function(sprite, pointer) {
          board.onDragStopPiece(self, pointer);
        }, board);
        this.sprite.events.onDragUpdate.add(function(sprite, pointer) {
          board.onDragUpdatePiece(self, pointer);
        }, board);
        this.sprite.events.onInputOver.add(function() {
          game.canvas.style.cursor = "-webkit-grab";
        }, this);
        this.sprite.events.onInputOut.add(function() {
          game.canvas.style.cursor = "default";
        }, this);
      }
    }
    if (this.moves === 0) {
      this.exhaust();
    } else {
      this.sprite.tint = this.owner.color;
    }

    if (this.text) {
      this.text.destroy();
    }
    if (this.flag) {
      this.flag.destroy();
    }
    this.text = game.add.text(
      tileWidth - 24,
      tileHeight - 24,
      this.health.toString(),
      {fill: '#ffffff', stroke: '#000000', strokeThickness: 6});
    this.text.inputEnabled = true;
    this.text.events.onInputOver.add(function(e) {
      $('.tooltip').html('Health').show();
    }, this);
    this.text.events.onInputOut.add(function() {
      $('.tooltip').hide();
    }, this);
    this.sprite.addChild(this.text);

    if (this.owner.human && this.tile.owner !== this.owner) {
      this.flag = game.add.sprite(tileWidth/2, -14, 'captureFlag');
      this.flag.width = 28;
      this.flag.height = 28;
      this.flag.inputEnabled = true;
      this.flag.events.onInputOver.add(function(e) {
        $('.tooltip').html('Double-click to capture this tile').show();
      }, this);
      this.flag.events.onInputOut.add(function() {
        $('.tooltip').hide();
      }, this);
      this.sprite.addChild(this.flag);
    }
  }
}

class ProductPiece extends Piece {
  constructor(player, product, strength, movement) {
    super(player);
    this.product = product;
    this.name = this.product.name;
    this.spriteName = 'productPiece';
    this.health = strength;
    this.moves = movement;
    this.movement = movement;
    this.maxHealth = strength;
  }
}

export default {
  Product: ProductPiece
};
