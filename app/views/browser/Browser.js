import $ from 'jquery';
import _ from 'underscore';
import util from 'util';
import Enums from 'app/Enums';
import Datamap from 'datamaps';
import Popup from '../Popup';
import News from './News';
import CMail from './Mail';
import CherublistTemplate from './Cherublist';
import map from 'data/map.json';
import markets from 'data/markets.json';
import locations from 'data/locations.json';

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
        <li data-site="mail">cMail</li>
      </ul>
      <div class="appmenu">
          <span>●</span>
          <span>●</span>
          <span>●</span>
      </div>
  </div>
  <div class="viewport overview">
    <div class="cherublist site">
      ${CherublistTemplate(data)}
    </div>
    <div class="news site"></div>
    <div class="mail site"></div>
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

    var marketPercents = _.object(
      _.map(_.keys(markets), function(m) {
        return m.toLowerCase();
      }),
      _.map(_.values(markets), function(m) {
        var locationsForMarket = _.where(locations, {market: m}),
            ownedLocationsForMarket = _.where(player.company.locations, {market: m}),
            marketPercent = ownedLocationsForMarket.length/locationsForMarket.length;
        if (!marketPercent) {
          return 'rgba(0,0,0,0.1)';
        }
        return 'rgba(255,53,53,'+marketPercent+')';
      })
    );

    var datamap = new Datamap({
      element: document.getElementById('map'),
      fills: _.extend({
        defaultFill: 'rgba(0,0,0,0.1)'
      }, marketPercents),
      data: map, // country fill keys, mapped to continents
      geographyConfig: {
        hideAntarctica: false,
        popupOnHover: false,
        highlightOnHover: false
      }
    });
  }

  render() {
    var data = this.player.snapshot;
    super.render(data);

    this.mailView = new CMail();
    this.mailView.render(data);

    this.newsView = new News();
    this.newsView.render(data);
  }

  update() {
    var data = this.player.snapshot;
    this.el.find('.clock').text(`${util.enumName(data.month, Enums.Month)}, ${data.year}`);
    this.mailView.update(data);
    // this.newsView.update(data);
  }
}

export default Browser;
