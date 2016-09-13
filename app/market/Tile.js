/*
 * Tile
 * - has a type (Empty, Income, or Influencer)
 * - Income & Influencer tiles can have an owner/be captured
 * - Income tiles have an income level
 */

import 'pixi';
import 'p2';
import * as Phaser from 'phaser';
import _ from 'underscore';
import config from 'config';
import Piece from './Piece';

const onSingleClick = new Phaser.Signal();
const onDoubleClick = new Phaser.Signal();
const onCapture = new Phaser.Signal();

class Tile {
  constructor(piece) {
    this.name = 'Empty tile';
    this.description = '';
    this.piece = piece;
    this.spriteName = 'emptyTile';
    this.color = 0xaee3ef;
    this.clicks = 0;
  }

  onClick() {
    var self = this;
    this.clicks += 1;
    if (this.clicks == 1) {
      setTimeout(function() {
        if (self.clicks == 1) {
          onSingleClick.dispatch(self);
        } else {
          onDoubleClick.dispatch(self);
        }
        self.clicks = 0;
      }, 300);
    }
  }

  resetColor() {
    if (this.owner !== undefined) {
      this.sprite.tint = this.owner.color;
    } else {
      this.sprite.tint = this.color;
    }
  }

  render(coord, group, game) {
    this.sprite = group.create(coord.x, coord.y, this.spriteName);
    this.resetColor();
    this.sprite.inputEnabled = true;
    this.sprite.events.onInputDown.add(this.onClick, this);
    this.sprite.events.onInputOver.add(function() {
      game.canvas.style.cursor = "pointer";
    }, this);
    this.sprite.events.onInputOut.add(function() {
      game.canvas.style.cursor = "default";
    }, this);
  }
}

class OwnedTile extends Tile {
  constructor(piece, owner) {
    super(piece);
    this.owner = owner;

    this.baseCost = config.BASE_CAPTURE_COST;
    this.capturedCost = 0;
  }

  render(coord, group, game, tileHeight) {
    super.render(coord, group, game);
    this.text = game.add.text(
      12,
      tileHeight - 24,
      (this.baseCost - this.capturedCost).toString(),
      {fill: '#ffffff', stroke: '#000000', strokeThickness: 6});
    this.sprite.addChild(this.text);
    if (!this.capturedCost) {
      this.text.text = '';
    }
  }

  capture(productPiece) {
    if (productPiece.owner != this.owner && productPiece.moves > 0) {
      this.capturedCost = this.capturedCost + productPiece.health;
      productPiece.exhaust();
      this.text.text = (this.baseCost - this.capturedCost).toString();

      // successfully captured
      if (this.capturedCost >= this.baseCost) {
        this.preCapture();
        if (this.owner) {
          this.owner.tiles = _.without(this.owner.tiles, this);
        }
        this.capturedCost = 0;
        this.owner = productPiece.owner;
        this.owner.tiles.push(this);
        this.sprite.tint = this.owner.color;
        this.text.text = '';
        this.postCapture();
        onCapture.dispatch(this);
        return true;
      }
    }
    return false;
  }
  preCapture() {}
  postCapture() {}
}

class InfluencerTile extends OwnedTile {
  constructor(piece, owner) {
    super(piece, owner);
    this.spriteName = 'influencerTile';
    this.color = 0xff98f6;
    this.name = 'Thought Leader';
    this.description = 'Inspires consumption, boosting revenue';
  }
}

class IncomeTile extends OwnedTile {
  constructor(piece, owner) {
    super(piece, owner);

    // randomly set income value of tile
    var roll = Math.random(),
        cuml = 0;
    for (var i=0; i < config.INCOME_DISTRIBUTION.length; i++) {
      cuml += config.INCOME_DISTRIBUTION[i];
      if (roll <= cuml) {
        this.income = i;
        break;
      }
    }
    this.spriteName = `income${this.income}Tile`;
    this.color = 0x85ff85;
    this.description = ''; // this is set by the Market state

    switch (this.income) {
      case 0:
        this.name ='Low income market share';
        break;
      case 1:
        this.name = 'Middle class market share';
        break;
      case 2:
        this.name = 'Upper class market share';
        break;
      case 3:
        this.name = 'Luxury market share';
        break;
    }
  }
  onDoubleClick() {
    super.onDoubleClick();
  }
}

function random() {
  var roll = Math.random();
  if (roll <= config.TILE_PROBS.empty) {
    return new Tile();
  } else if (roll <= config.TILE_PROBS.empty + config.TILE_PROBS.influencer) {
    return new InfluencerTile();
  } else {
    return new IncomeTile();
  }
}

function setColor(tile) {
}

export default {
  onSingleClick: onSingleClick,
  onDoubleClick: onDoubleClick,
  onCapture: onCapture,
  Empty: Tile,
  Influencer: InfluencerTile,
  Income: IncomeTile,
  random: random
};
