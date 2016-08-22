import $ from 'jquery';
import _ from 'underscore';
import util from 'util';
import View from './View';
import Popup from './Popup';

const template = data => `
<div class="split-pane ${util.slugify(data.title)}">
  <ul class="list">
    ${data.items.map(i => `
      <li class="${i.owned ? 'owned' : ''}">${i.name}</li>
    `).join('')}
  </ul>
  <div class="detail"></div>
</div>
`

class DetailList extends Popup {
  constructor(params) {
    params = _.extend({
      template: template
    }, params);
    params.handlers = _.extend({
      '.list li': function(ev) {
        var $el = $(ev.target),
            idx = $el.index();
        this.selected = this.dataSrc[idx];

        this.el.find('.list li').removeClass('selected');
        $el.addClass('selected');
        this.renderDetailView(this.selected);
      }
    }, params.handlers);
    super(params);
    this.detailView = new View({
      template: params.detailTemplate
    });
  }

  render(data) {
    super.render(_.extend({
      title: this.title
    }, data));
  }

  postRender() {
    this.detailView.el = this.el.find('.detail');
    this.el.find('.list li').first().click();
  }

  renderDetailView(seleted) {
    this.detailView.render(selected);
  }
}

export default DetailList;
