import $ from 'jquery';
import _ from 'underscore';
import util from 'util';
import templ from '../Common';
import View from 'views/View';
import CardsList from 'views/CardsList';
import Condition from 'game/Condition';
import productRecipes from 'data/productRecipes.json';

const detailTemplate = item => `
  <div class="title">
    <h1>${item.name}</h1>
  </div>
  <p>${Condition.toString(item.condition)}</p>
`

class ChallengesView extends CardsList {
  constructor(player) {
    super({
      title: 'Challenges',
      detailTemplate: detailTemplate,
      handlers: {
        '.toggle-filter': function() {
          this.showAll = !this.showAll;
          var text = this.showAll ? 'Show Completed' : 'Show All';
          $('.toggle-filter').text(text);
        }
      }
    });
    this.player = player;
    this.showAll = true;
  }

  render() {
    var player = this.player;
    super.render({
      items: this.player.challenges
    });

    // hacky
    this.el.find('header').append('<div class="toggle-filter">Show Completed</div>');
  }

  update() {
    var self = this;
    _.each(_.zip(this.player.challenges, this.subviews), function(v) {
      var sv = v[1],
          item = v[0];

      if (self.showAll) {
        sv.el.show();
      } else if (!item.finished) {
        sv.el.hide();
      }
    });

    this.el.find('.current-cash-value').hide();
  }

  createListItem(item) {
    return new View({
      tag: 'li',
      parent: this.el.find('ul'),
      template: this.detailTemplate,
      method: 'append',
      attrs: {
        class: item.finished ? 'finished' : ''
      }
    });
  }
}

export default ChallengesView;

