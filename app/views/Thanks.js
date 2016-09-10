import $ from 'jquery';
import _ from 'underscore';
import View from 'views/View';
import backers from 'data/backers.json';

const template = data => `
<div class="popup">
  <div class="thanks">
    <h1>Thank you to our Kickstarter backers!</h1>
    <ul>
      ${data.backers.map(i => `<li>${i}</li>`).join('')}
    </ul>
  </div>
</div>
`;

class Thanks extends View {
  constructor(params) {
    super(_.extend({
      parent: '.popups',
      template: template
    }, params));
    this.registerHandlers({
      '.popup': function() {
        this.remove();
      }
    });
  }

  render() {
    super.render({
      backers: backers
    });
  }

  postRender() {
    $('.popups').show();
  }

  postRemove() {
    $('.popups').hide();
  }
}

export default Thanks;
