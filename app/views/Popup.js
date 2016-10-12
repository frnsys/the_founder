import $ from 'jquery';
import _ from 'underscore';
import util from 'util';
import View from './View';
import Manager from 'app/Manager';

const template = data => `
<div class="popup ${util.slugify(data.title)}">
  <header><h1>${data.title}</h1> <span class="close-popup">X</span></header>
  ${data.template}
</div>
`

class Popup extends View {
  constructor(params) {
    var nestedTemplate = params.template;
    params.template = data => template({
      title: params.title,
      template: nestedTemplate(data)
    });
    params.handlers = _.extend({
      '.close-popup': function() {
        this.remove();
      },
    }, params.handlers);
    super(_.extend({
      parent: '.popups',
    }, params));
  }

  postRender() {
    super.postRender();
    var self = this,
        state = Manager.game.state.states[Manager.game.state.current];
    if (_.isFunction(state.pause)) {
      state.pause();
    }
    $('.popups').show();
    Popup.current = this;

    // hacky
    $(document).off('keydown');
    $(document).on('keydown', function(e) {
      if (e.which === 27) {  // esc
        self.remove();
      }
      e.preventDefault();
    });
  }

  postRemove() {
    super.postRemove();
    var state = Manager.game.state.states[Manager.game.state.current];
    if (_.isFunction(state.resume)) {
      state.resume();
    }
    $('.popups').hide();
    Popup.current = null;
    $(document).off('keydown');
  }
}

Popup.current = null;
export default Popup;
