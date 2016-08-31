/*
 * Piece
 * - the combat units in the Market
 * - can capture tiles
 * - can attack other pieces
 * - have limited number of moves per turn
 * - have strength/health
 * - belong to a particular player
 */

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
    // attacker has the initiative
    other.damage(this.power);

    // defender must still be alive to fight back
    if (other.health > 0) {
      this.damage(other.power);
    }
    this.exhaust();
  }

  get power() {
    // sometimes there is random bonus damage
    var bonus = Math.random() <= 0.05 ? 1 : 0;
    return Math.min(Math.floor(this.health/2 + bonus, 1));
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
    console.log('piece of');
    console.log(this.owner);
    console.log('got destroyed');
    this.tile.piece = null;
    this.owner.pieces = _.without(this.owner.pieces, this);
    this.sprite.destroy();
  }

  exhaust() {
    this.moves = 0;
    this.sprite.tint = shadeColor(this.owner.color, -0.5);
  }

  reset() {
    this.moves = this.movement;
    this.sprite.tint = this.owner.color;
  }

  render(coord, group, game, tileHeight, tileWidth) {
    if (this.sprite) {
      this.sprite.destroy();
    }
    this.sprite = group.create(coord.x, coord.y, this.spriteName);
    if (this.moves === 0) {
      this.exhaust();
    } else {
      this.sprite.tint = this.owner.color;
    }

    this.text = game.add.text(
      tileWidth - 24,
      tileHeight - 24,
      this.health.toString(),
      {fill: '#ffffff', stroke: '#000000', strokeThickness: 6});
    this.sprite.addChild(this.text);
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
