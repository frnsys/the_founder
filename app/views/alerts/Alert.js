import $ from 'jquery';
import _ from 'underscore';
import View from '../View';
import Manager from 'app/Manager';
import Popup from 'views/Popup';

const template = data => `
<div class="alert-message alert-pop">
  <p>${data.message}</p>
  <div class="alert-actions">
    <button class="dismiss-alert">Ok</button>
  </div>
</div>
`

class Alert extends View {
  constructor(params) {
    var params = params || {};
    super(_.extend({
      parent: '.alert-wrapper',
      template: template,
      attrs: {class: 'alert'}
    }, params));
    this.onDismiss = params.onDismiss;
    this.registerHandlers({
      '.dismiss-alert': function() {
        this.remove();
        if (this.onDismiss) {
          this.onDismiss();
        }
      }
    });
  }

  postRender() {
    super.postRender();
    var state = Manager.game.state.states[Manager.game.state.current];
    if (_.isFunction(state.pause)) {
      state.pause();
    }
    Alert.current = this;
    $(this.parent).show();
  }

  postRemove() {
    super.preRemove();
    var state = Manager.game.state.states[Manager.game.state.current];
    if (_.isFunction(state.resume) && !Popup.current) {
      state.resume();
    }
    Alert.current = null;
    $(this.parent).hide();
  }
}

Alert.current = null;
export default Alert;
