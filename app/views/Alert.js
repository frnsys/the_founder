import $ from 'jquery';
import _ from 'underscore';
import View from './View';

const template = data => `
<div class="alert-message">
  ${data.message}
</div>
<div class="alert-actions">
  <button class="ok">Ok</button>
</div>
`

class Alert extends View {
  constructor(params) {
    super(_.extend({
      parent: '.alert',
      template: template,
    }, params));
    this.registerHandlers({
      '.ok': function() {
        this.remove();
      }
    });
  }

  postRender() {
    super.postRender();
    $('.alert-wrapper').show();
  }

  postRemove() {
    super.preRemove();
    $('.alert-wrapper').hide();
  }
}

export default Alert;
