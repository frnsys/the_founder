import $ from 'jquery';
import _ from 'underscore';
import View from './View';

class Alert extends View {
  constructor(params) {
    super(_.extend({
      el: $('.alert'),
      parent: $('.alert-wrapper')
    }, params));
  }
}

export default Alert;
