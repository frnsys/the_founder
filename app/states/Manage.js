/*
 * Manage
 * - the main state of the game (office view)
 */

import 'pixi';
import 'p2';
import * as Phaser from 'phaser';
import $ from 'jquery';
import _ from 'underscore';
import Clock from 'app/Clock';
import Popup from 'views/Popup';
import HUD from 'views/manage/HUD';
import Menu from 'views/manage/Menu';
import Task from 'game/Task';
import Worker from 'game/Worker';
import Product from 'game/Product';
import Office from 'office/Office';
import SelectUI from 'office/Select';
import ObjectSelectionView from 'views/select/Object';
import EmployeeSelectionView from 'views/select/Employee';
import ProductDesignerView from 'views/ProductDesigner';
import TaskCompleteView from 'views/alerts/TaskComplete';
import MarketReport from 'views/alerts/MarketReport';
import Debug from 'debug/Debug';

const ONBOARDING_WAIT = 150; // frames

class Manage extends Phaser.State {
  constructor(game, player, debug) {
    super();
    this.game = game;
    this.player = player;
    this.debug = debug;
  }

  init(player) {
    this.player = player || this.player;
  }

  preload() {
    $('.ui').empty();
  }

  create() {
    var office = this.showOffice();
    this.hud = new HUD(this.player);
    this.menu = new Menu(this.player, office);
    this.clock = new Clock(this, this.player, office);
    this.selectUI = new SelectUI(office, this.showSelection.bind(this));
    this.menu.render();
    this.hud.render();
    this.clock.updateChallenge();

    // hacky, show challenges on HUD challenge click
    $('.hud-challenges').off();
    $('.hud-challenges').on('click', () => {
      // sooo hacky
      $('.manage-challenges').click();
    });

    $('#office, .hud, .menu').show();
    $('.selection').hide();

    // new game, hire the cofounder first
    if (this.player.company.workers.length === 0) {
      this.player.company.hireEmployee(Worker.init(this.player.company.cofounder), 0);
      this.player.company.workers[0].title = 'Cofounder';
    }

    Product.onProductLaunch = this.enterTheMarket.bind(this);
    Task.onFinish = this.finishedTask.bind(this);

    if (this.marketResults) {
      var report = new MarketReport();
      report.render(this.marketResults);
      this.marketResults = null;
    }
  }

  pause() {
    this.clock.pause();
    this.office.pause();
  }

  resume() {
    this.clock.resume();
    this.office.resume();
  }

  enterTheMarket(p) {
    var self = this;
    this.pause();

    var competitor = _.sample(_.filter(this.player.competitors, c => !c.disabled));
    var view = new ProductDesignerView(p, competitor, this.player),
      postRemove = view.postRemove.bind(view);
    view.postRemove = function() {
      postRemove();
      $('#office, .hud, .menu, .selection').hide();
      if (self.selectionView) {
        self.selectionView.remove();
        self.selectedObject = null;
      }
      $('.employee-thought, .employee-burntout').remove();
      $('#market').show();
      self.game.state.start('Market', true, false, p, competitor, self.player);
    };
    view.render();
  }

  finishedTask(task) {
    if (!_.contains([Task.Type.Product, Task.Type.Event], task.type)) {
      var view = new TaskCompleteView(task);
      view.render();
    }
  }

  update() {
    this.hud.update();
    this.clock.update();
    if (this.selectionView && this.selectedObject) {
      this.selectionView.update(this.selectedObject);
    }

    // wait a little before checking on onboarding events
    if (this.clock.frames >= ONBOARDING_WAIT) {
      this.player.onboarder.resolve();
    }

    if (Popup.current && _.isFunction(Popup.current.update)) {
      Popup.current.update();
    }
  }

  showOffice() {
    var self = this;
    this.office = new Office(this.player.company.office, this.player.company, function() {
      _.each(self.player.company.perks, self.office.addPerk.bind(self.office));
      _.each(self.player.company.workers, self.office.addEmployee.bind(self.office));
      self.office.updateObjectStats();

      if (self.debug) {
        Debug.debugOffice(self.office);
      }
    });
    this.office.render();
    return this.office;
  }

  showSelection(mesh) {
    var template;
    if (mesh.type === 'employee') {
      this.selectionView = new EmployeeSelectionView(this.player.company);
    } else if (_.contains(['agent', 'object'], mesh.type)) {
      this.selectionView = new ObjectSelectionView();
    }
    this.selectedObject = mesh.object;
    this.selectionView.render(mesh.object);
  }
}

export default Manage;
