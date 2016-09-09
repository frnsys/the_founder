import $ from 'jquery';
import _ from 'underscore';
import util from 'util';
import View from 'views/View';
import Popup from 'views/Popup';

const template = data => `
  <div class="current-cash">
    <div class="current-cash-value"></div>
  </div>
  <ul class="cards"></ul>`;

class CardsList extends Popup {
  constructor(params) {
    super(_.extend({
      template: template
    }, params));
  }

  itemIndex(target) {
    return $(target).closest('.card').index();
  }

  render(data) {
    super.render(data);
    if (!this.subviews || this.subviews.length === 0) {
      this.subviews = _.map(data.items, i => this.createListItem(i));
    }
    _.each(_.zip(this.subviews, data.items), function(si) {
      var subview = si[0],
          item = si[1];
      if (!subview.attrs.class) {
        subview.attrs.class = 'card';
      } else if (!subview.attrs.class.includes('card')) {
        subview.attrs.class += ' card';
      }
      subview.render(item);
    });
  }

  createListItem(item) {
    return new View({
      tag: 'li',
      parent: this.el.find('ul'),
      template: this.detailTemplate,
      method: 'append',
    });
  }
}

export default CardsList;
