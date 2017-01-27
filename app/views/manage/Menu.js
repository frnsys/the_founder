import $ from 'jquery';
import _ from 'underscore';
import util from 'util';
import View from 'views/View';
import Employees from './Employees';
import Locations from './Locations';
import Acquisitions from './Acquisitions';
import Perks from './Perks';
import Products from './Products';
import Recruiting from './Recruiting';
import Verticals from './Verticals';
import ProductTypes from './ProductTypes';
import Browser from '../browser/Browser.js';
import Accounting from './Accounting';
import Challenges from './Challenges';
import Settings from './Settings';
import Confirm from 'views/alerts/Confirm';
import Alert from 'views/alerts/Alert';

const menuItems = [
  ['locations', 'Locations'],
  ['verticals', 'Verticals'],
  ['productTypes', 'Product Types'],
  ['acquisitions', 'Acquire'],
  ['recruiting', 'Recruiting'],
  ['employees', 'Employees'],
  ['perks', 'Perks']
];

function template(data) {
  var office = '';
  if (data.nextOffice) {
    office = `
      <li class="upgrade-office">
        <img src="assets/manage/upgrade.gif">
        <div class="tip">Upgrade Office</div>
      </li>`;
  }
  return `
  <ul class="grid manage-menu">
    ${_.map(menuItems, function(v) {
      if (data.onboarding[v[0]]) {
        return `
          <li class="manage-${v[0]}">
            <img src="assets/manage/${v[0]}.gif">
            <div class="tip">${v[1]}</div>
          </li>`
      } else {
        return '';
      }
    }).join('')}
    </li>
    <li class="manage-products">
      <img src="assets/manage/products.gif">
      <div class="tip">Discovered Products</div>
    </li>
    <li class="manage-browser">
      <img src="assets/manage/internet.gif">
      <div class="tip">WWW</div>
    </li>
    <li class="manage-accounting">
      <img src="assets/manage/accounting.gif">
      <div class="tip">Accounting</div>
    </li>
    <li class="manage-challenges">
      <img src="assets/manage/challenges.gif">
      <div class="tip">Challenges</div>
    </li>
    ${office}
    <li class="manage-settings">
      <img src="assets/manage/settings.gif">
      <div class="tip">Settings</div>
    </li>
  <ul>`;
}

class Menu extends View {
  constructor(player, office) {
    super({
      parent: '.menu',
      template: template
    });
    this.office = office;
    this.player = player;
    this.registerHandlers({
      '.manage-locations': this.showView(Locations),
      '.manage-verticals': this.showView(Verticals),
      '.manage-productTypes': this.showView(ProductTypes),
      '.manage-acquisitions': this.showView(Acquisitions),
      '.manage-perks': this.showView(Perks, office),
      '.manage-employees': this.showView(Employees),
      '.manage-products': this.showView(Products),
      '.manage-recruiting': this.showView(Recruiting),
      '.manage-browser': this.showView(Browser),
      '.manage-settings': this.showView(Settings),
      '.manage-accounting': this.showView(Accounting),
      '.manage-challenges': this.showView(Challenges),
      '.selected': function() {
        // unselect and hide view
        $('.ui').empty();
        $('.manage-menu .selected').removeClass('selected');
      },
      '.upgrade-office': function() {
        var next = player.company.nextOffice,
            canAfford = player.company.cash >= next.cost,
            view;
        if (canAfford) {
          view = new Confirm(function() {
            if (player.company.upgradeOffice()) {
              $('.employee-thought, .employee-burntout').remove();
              office.setLevel(next.level, function() {
                _.each(player.company.perks, p => {
                  _.each(_.range(p.upgradeLevel + 1), i => {
                    office.addPerk(p.upgrades[i]);
                  });
                });
                _.each(player.company.workers, office.addEmployee.bind(office));
              });
              // this.render();
            }
          });
          view.render(`This upgrade will cost you ${util.formatCurrencyAbbrev(next.cost)}. Are you sure?`);
        } else {
          view = new Alert();
          view.render({message: `This upgrade will cost you ${util.formatCurrencyAbbrev(next.cost)}. You can't afford that.`});
        }
      }
    });
  }

  postRender() {
    $('.manage-menu li').on('mousemove', function(e) {
      var $el = $(e.target);
      $el.find('.tip').show();
    }).on('mouseleave', function(e) {
      $('.manage-menu .tip').hide();
    });
    $('.manage-menu').on('mouseleave', function(e) {
      $('.manage-menu .tip').hide();
    });
  }

  render() {
    super.render({
      nextOffice: this.player.company.nextOffice,
      onboarding: this.player.snapshot.onboarding
    });
  }

  showView(view) {
    var self = this,
        player = this.player,
        office = this.office;
    return function(e) {
      $('.manage-menu').find('.selected').removeClass('selected');
      $(e.target).closest('li').addClass('selected');
      var v = new view(player, office),
          postRemove = v.postRemove.bind(v);
      v.render();
      v.postRemove = function() {
        $('.manage-menu').find('.selected').removeClass('selected');
        postRemove();
      };
    }
  }
}

// hacky
$('.show-about-help').on('click', function() {
  var view = new Alert();
  view.render({
    message: '<div class="about-help"><p><em class="about-game-title">The Founder: A Dystopian Business Simulator</em> is a game about technology, power, and profit. Found a startup and keep your investors happy by growing for as fast and as long as possible.</p><p>It was designed and developed by <a href="https://twitter.com/frnsys">Francis Tseng</a>.</p><p>The soundtrack is by <a href="https://maxoisnuts.bandcamp.com/">Maxo</a>.</p><p>This game works best on Chrome or Chromium.</p></div>'
  });
});

export default Menu;
