import $ from 'jquery';
import _ from 'underscore';
import util from 'util';
import View from './View';

const template = data => `
<div class="popup ${util.slugify(data.title)}" style="background:${data.background};">
  <header><h1>${data.title}</h1> <span class="close-popup">X</span></header>
  ${data.template}
</div>
`

class Popup extends View {
  constructor(params) {
    var nestedTemplate = params.template;
    params.template = data => template({
      title: params.title,
      background: params.background,
      template: nestedTemplate(data)
    });
    params.handlers = _.extend({
      '.close-popup': function() {
        this.remove();
      },
    }, params.handlers);
    super(_.extend({
      el: $('.popups'),
      parent: $('.popups')
    }, params));
  }
}

export default Popup;
