import 'pixi';
import 'p2';
import * as Phaser from 'phaser';
import $ from 'jquery';
import _ from 'underscore';
import Clock from 'app/Clock';
import Popup from 'views/Popup';
import HUD from 'views/manage/HUD';
import Menu from 'views/manage/Menu';
import Alert from 'views/Alert';
import Task from 'game/Task';
import Product from 'game/Product';
import Office from 'office/Office';
import SelectUI from 'office/Select';
import ObjectSelectionView from 'views/select/Object';
import EmployeeSelectionView from 'views/select/Employee';
import ProductDesignerView from 'views/ProductDesigner';

class Manage extends Phaser.State {
  constructor(game, player) {
    super();
    this.game = game;
    this.player = player;
  }

  preload() {
    $('.ui').empty();
    $('.background').hide();
  }

  create() {
    var office = this.showOffice();
    this.clock = new Clock(this, this.player, office);
    this.hud = new HUD(this.player);
    this.menu = new Menu(this.player, office);
    this.selectUI = new SelectUI(office, this.showSelection.bind(this));
    this.menu.render();
    this.hud.render();

    Product.onProductLaunch = this.enterTheMarket.bind(this);
    Task.onFinish = this.finishedTask.bind(this);
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
    var view = new ProductDesignerView(p),
      postRemove = view.postRemove;
    view.postRemove = function() {
      postRemove();
      console.log('launching into the market');
      $('#office, .hud, .menu').hide();
      if (self.selectionView) {
        self.selectionView.remove();
      }
      $('#market').show();
      self.game.state.start('Market', true, false, p);
    };
    view.render();
  }

  finishedTask(task) {
    if (!_.contains([Task.Type.Product, Task.Type.Event], task.type)) {
      var view = new Alert();
      view.render({message: `The ${task.obj.name} task finished.`});
    }
  }

  update() {
    this.hud.update();
    this.clock.update();
    if (this.selectionView && this.selectedObject) {
      this.selectionView.update(this.selectedObject);
    }
    this.player.onboarder.resolve();
    if (Popup.current && _.isFunction(Popup.current.update)) {
      Popup.current.update();
    }
  }

  showOffice() {
    var self = this;
    this.office = new Office(this.player.company.office, this.player.company, function() {
      _.each(self.player.company.perks, self.office.addPerk.bind(self.office));
      _.each(self.player.company.workers, self.office.addEmployee.bind(self.office));
      self.office.incrementObjectStats();
    });
    this.office.render();
    return this.office;
  }

  showSelection(mesh) {
    var template;
    if (mesh.type === 'employee') {
      this.selectionView = new EmployeeSelectionView();
    } else if (_.contains(['agent', 'object'], mesh.type)) {
      this.selectionView = new ObjectSelectionView();
    }
    this.selectedObject = mesh.object;
    this.selectionView.render(mesh.object);
  }
}

export default Manage;
