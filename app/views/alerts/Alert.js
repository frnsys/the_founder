import $ from 'jquery';
import _ from 'underscore';
import View from '../View';
import Manager from 'app/Manager';

const template = data => `
<div class="alert-message">
  ${data.message}
</div>
<div class="alert-actions">
  <button class="dismiss-alert">Ok</button>
</div>
`

class Alert extends View {
  constructor(params) {
    super(_.extend({
      parent: '.alert-wrapper',
      template: template,
      attrs: {class: 'alert'}
    }, params));
    this.registerHandlers({
      '.dismiss-alert': function() {
        this.remove();
      }
    });
  }

  postRender() {
    super.postRender();
    var state = Manager.game.state.states[Manager.game.state.current];
    if (_.isFunction(state.pause)) {
      state.pause();
    }
    $('.alert-wrapper').show();
  }

  postRemove() {
    super.preRemove();
    var state = Manager.game.state.states[Manager.game.state.current];
    if (_.isFunction(state.resume)) {
      state.resume();
    }
    $('.alert-wrapper').hide();
  }
}

export default Alert;
