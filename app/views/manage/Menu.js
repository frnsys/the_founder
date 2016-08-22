import $ from 'jquery';
import util from 'util';
import View from 'views/View';
import Confirm from 'views/Confirm';
import Lobbying from './Lobbying';
import Employees from './Employees';
import Locations from './Locations';
import Acquisitions from './Acquisitions';
import Perks from './Perks';
import Products from './Products';
import Recruiting from './Recruiting';
import SpecialProjects from './SpecialProjects';
import Verticals from './Verticals';
import Research from './Research';
import ProductTypes from './ProductTypes';
import Browser from '../browser/Browser.js';
import Settings from './Settings';

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
    <li class="manage-locations">
      <img src="assets/manage/locations.gif">
      <div class="tip">Locations</div>
    </li>
    <li class="manage-verticals">
      <img src="assets/manage/verticals.gif">
      <div class="tip">Verticals</div>
    </li>
    <li class="manage-products">
      <img src="assets/manage/products.gif">
      <div class="tip">Products</div>
    </li>
    <li class="manage-productTypes" data-name="Product Types">
      <img src="assets/manage/productTypes.gif">
      <div class="tip">Product Types</div>
    </li>
    <li class="manage-specialProjects">
      <img src="assets/manage/specialProjects.gif">
      <div class="tip">Special Projects</div>
    </li>
    <li class="manage-acquisitions">
      <img src="assets/manage/acquisitions.gif">
      <div class="tip">Acquire</div>
    </li>
    <li class="manage-lobbying">
      <img src="assets/manage/lobbying.gif">
      <div class="tip">Lobbying</div>
    </li>
    <li class="manage-recruiting">
      <img src="assets/manage/recruiting.gif">
      <div class="tip">Recruiting</div>
    </li>
    <li class="manage-employees">
      <img src="assets/manage/employees.gif">
      <div class="tip">Employees</div>
    </li>
    <li class="manage-perks">
      <img src="assets/manage/perks.gif">
      <div class="tip">Perks</div>
    </li>
    <li class="manage-research">
      <img src="assets/manage/research.gif">
      <div class="tip">Research</div>
    </li>
    <li class="manage-browser">
      <img src="assets/manage/internet.gif">
      <div class="tip">WWW</div>
    </li>
    ${office}
    <li class="manage-settings">
      <img src="assets/manage/settings.gif">
      <div class="tip">Settings</div>
    </li>
  <ul>`;
}


function showView(view, player, office) {
  return function(e) {
    $('.manage-menu').find('.selected').removeClass('selected');
    $(e.target).closest('li').addClass('selected');
    var v = new view(player, office);
    v.render();
    v.postRemove = function() {
      $('.manage-menu').find('.selected').removeClass('selected');
    };
  }
}


class Menu extends View {
  constructor(player, office) {
    super({
      el: $('.menu'),
      template: template,
      handlers: {
        '.manage-locations': showView(Locations, player),
        '.manage-verticals': showView(Verticals, player),
        '.manage-productTypes': showView(ProductTypes, player),
        '.manage-specialProjects': showView(SpecialProjects, player),
        '.manage-acquisitions': showView(Acquisitions, player),
        '.manage-lobbying': showView(Lobbying, player),
        '.manage-research': showView(Research, player),
        '.manage-perks': showView(Perks, player, office),
        '.manage-employees': showView(Employees, player),
        '.manage-products': showView(Products, player),
        '.manage-recruiting': showView(Recruiting, player, office),
        '.manage-browser': showView(Browser, player),
        '.manage-settings': showView(Settings, player),
        '.selected': function() {
          // unselect and hide view
          $('.ui').empty();
          $('.manage-menu .selected').removeClass('selected');
        },
        '.upgrade-office': function() {
            var next = player.company.nextOffice;
            var view = new Confirm(function() {
              if (player.company.upgradeOffice()) {
                office.setLevel(next.level, function() {
                  _.each(player.company.perks, office.addPerk.bind(office));
                  _.each(player.company.workers, office.addEmployee.bind(office));
                });
                render({nextOffice: player.company.nextOffice});
              }
              this.remove();
            }, this.remove);
            view.render({
              message: 'This upgrade will cost you $' + abbreviateNumber(next.cost, 3) + '. Are you sure?'
            });
        }
      }
    });
    this.player = player;
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
      nextOffice: this.player.nextOffice
    });
  }
}

export default Menu;
