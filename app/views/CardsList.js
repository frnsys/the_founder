import $ from 'jquery';
import _ from 'underscore';
import util from 'util';
import View from 'views/View';
import Popup from 'views/Popup';

const template = data => `<ul class="cards"></ul>`;

class CardsList extends Popup {
  constructor(params) {
    super(_.extend({
      template: template
    }, params));
  }

  itemIndex(target) {
    return $(target).closest('li').index();
  }

  render(data) {
    super.render(data);
    if (!this.subviews) {
      this.subviews = _.map(data.items, i => this.createListItem(i));
    }
    _.each(_.zip(this.subviews, data.items), function(si) {
      var subview = si[0],
          item = si[1];
      subview.render(item);
    });
  }

  createListItem(item) {
    return new View({
      tag: 'li',
      parent: this.el.find('ul'),
      template: this.detailTemplate,
      method: 'append'
    });
  }
}

export default CardsList;
