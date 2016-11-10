import $ from 'jquery';
import _ from 'underscore';
import util from 'util';
import Enums from 'app/Enums';
import Popup from '../Popup';
import News from './News';
import CMail from './Mail';
import Corpwatch from './Corpwatch';
import Cherublist from './Cherublist';

const template = data => `
<div class="computer">
  <div class="statusbar">
      <div class="statusbar-left">❖ <b>Ultron</b> <span>File</span> <span>Edit</span> <span>Window</span></div>
      <div class="statusbar-right">
          <img src="assets/computer/volume.svg"> <img src="assets/computer/wifi.svg"> <span class="clock">${util.enumName(data.month, Enums.Month)}, ${data.year}</span>
      </div>
  </div>
  <div class="appbar">
      <ul class="tabbar">
        <li data-site="cherublist">cherublist</li>
        <li data-site="news">The Times Journal</li>
        <li data-site="corpwatch">CorpWatch</li>
        <li data-site="mail">cMail</li>
      </ul>
      <div class="appmenu">
          <span>●</span>
          <span>●</span>
          <span>●</span>
      </div>
  </div>
  <div class="viewport overview">
    <div class="cherublist site"></div>
    <div class="news site"></div>
    <div class="mail site"></div>
    <div class="corpwatch site"></div>
  </div>
</div>
`;


class Browser extends Popup {
  constructor(player) {
    super({
      title: 'Internet',
      template: template,
      handlers: {
        '.tabbar li': function(ev) {
          var $el = $(ev.target),
              site = $el.data('site');
          $('.tabbar li').removeClass('selected');
          $el.addClass('selected');
          $('.site').hide();
          $('.'+site).show();
        }
      }
    });
    this.player = player;
  }

  postRender() {
    super.postRender();
    var player = this.player;
    this.el.find('.tabbar li:first').addClass('selected');
  }

  render() {
    var data = this.player.snapshot;
    super.render(data);

    this.mailView = new CMail();
    this.mailView.render(data);

    this.newsView = new News();
    this.newsView.render(data);

    this.corpwatchView = new Corpwatch();
    this.corpwatchView.render(data);

    this.cherublistView = new Cherublist(this.player);
    this.cherublistView.render(data);
  }

  update() {
    var data = this.player.snapshot;
    this.el.find('.clock').text(`${util.enumName(data.month, Enums.Month)}, ${data.year}`);
    this.mailView.update(data);
    this.newsView.update(data);
    this.corpwatchView.update(data);
    this.cherublistView.update(data);
  }
}

export default Browser;
