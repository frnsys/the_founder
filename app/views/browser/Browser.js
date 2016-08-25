import $ from 'jquery';
import _ from 'underscore';
import Datamap from 'datamaps';
import View from '../View';
import MailTemplate from './Mail';
import CherublistTemplate from './Cherublist';
import NewsTemplate from './News';
import map from 'data/map.json';
import markets from 'data/markets.json';
import locations from 'data/locations.json';

const template = data => `
<div class="computer">
  <div class="statusbar">
      <div class="statusbar-left">❖ <b>Ultron</b> <span>File</span> <span>Edit</span> <span>Window</span></div>
      <div class="statusbar-right">
          <img src="assets/computer/volume.svg"> <img src="assets/computer/wifi.svg"> January 1, ${data.year}
      </div>
  </div>
  <div class="appbar">
      <ul class="tabbar">
        ${data.showAnnualReport ? '<li data-site="mail">cMail</li>' : ''}
        <li data-site="cherublist">cherublist</li>
        <li data-site="news">The Times Journal</li>
      </ul>
      <div class="appmenu">
          <span>●</span>
          <span>●</span>
          <span class="close-popup">●</span>
      </div>
  </div>
  <div class="viewport overview">
    ${data.showAnnualReport ? `<div class="mail site">${MailTemplate(data)}</div>` : ''}
    <div class="cherublist site">
      ${CherublistTemplate(data)}
    </div>

    <div class="news site">
      ${NewsTemplate(data)}
    </div>
  </div>
</div>
`;


class Browser extends View {
  constructor(player) {
    super({
      template: template,
      handlers: {
        '.close-popup': function() { this.remove(); },
        '.tabbar li': function(ev) {
          console.log('tab selected');
          var $el = $(ev.target),
              site = $el.data('site');
          $('.tabbar li').removeClass('selected');
          $el.addClass('selected');
          $('.site').hide();
          $('.'+site).show();
        },
        '.inbox li': function(ev) {
            var $el = $(ev.target),
                mail = $el.closest('li').data('mail');
            $('.inbox').hide()
            $('.email, .email-content[data-mail="'+mail+'"]').show();
        },
        '.show-inbox': function() {
            $('.inbox').show();
            $('.email, .email-content').hide();
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
    super.render(this.player.snapshot);
  }
}

export default Browser;
