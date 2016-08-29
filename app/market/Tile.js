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
import Piece from './Piece';

const BASE_CAPTURE_COST = 2;
const onSingleClick = new Phaser.Signal();
const onDoubleClick = new Phaser.Signal();
const onCapture = new Phaser.Signal();
const incomeDistribution = [0.65, 0.2, 0.125, 0.025];

class Tile {
  constructor(piece) {
    this.piece = piece;
    this.spriteName = 'emptyTile';
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
      }, 200);
    }
  }
}

class OwnedTile extends Tile {
  constructor(piece, owner) {
    super(piece);
    this.owner = owner;

    this.baseCost = BASE_CAPTURE_COST;
    this.capturedCost = 0;
  }
  capture(productPiece) {
    if (productPiece.owner != this.owner) {
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
    this.name = 'Thought Leader';
    this.description = 'Inspires consumption and influence in surrounding tiles.';
  }
}

class IncomeTile extends OwnedTile {
  constructor(piece, owner) {
    super(piece, owner);

    // randomly set income value of tile
    var roll = Math.random(),
        cuml = 0;
    for (var i=0; i < incomeDistribution.length; i++) {
      cuml += incomeDistribution[i];
      if (roll <= cuml) {
        this.income = i;
        break;
      }
    }
    this.spriteName = `income${this.income}Tile`;
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

export default {
  onSingleClick: onSingleClick,
  onDoubleClick: onDoubleClick,
  onCapture: onCapture,
  Empty: Tile,
  Influencer: InfluencerTile,
  Income: IncomeTile
};
