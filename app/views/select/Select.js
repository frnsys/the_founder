import $ from 'jquery';
import _ from 'underscore';
import View from 'views/View';

class SelectView extends View {
  constructor(params) {
    super(_.extend({
      el: $('.selection'),
    }, params));
  }

  postRender() {
    $('.selection').show();
  }

  postRemove() {
    $('.selection').hide();
  }
}

export default SelectView;
