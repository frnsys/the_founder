import _ from 'underscore';
import Promo from './Promo';
import Effect from './Effect';
import Product from'./Product';

const Type = {
  Product: 0,
  Promo: 1,
  Research: 2,
  Lobby: 3,
  SpecialProject: 4,
  Event: 5
};

// http://stackoverflow.com/a/2117523
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  });
}

const Task = {
  init: function(type, obj, workers, locations) {
    workers = workers || [];
    locations = locations || [];
    var task = {
      id: uuid(),
      type: Type[type],
      progress: 0,
      requiredProgress: obj.requiredProgress,
      obj: obj
    };
    _.each(workers, w => this.assign(task, w));
    _.each(locations, l => this.assign(task, l));
    return task;
  },

  assign: function(task, worker) {
    worker.task = task.id;
  },

  unassign: function(worker) {
    worker.task = null;
  },

  develop: function(task, company) {
    var workers = _.filter(company.workers, w => w.task == task.id),
        locations = _.filter(company.locations, l => l.task == task.id),
        scale = function(skill) {
          return skill/task.requiredProgress;
        };

    switch (task.type) {
        case Type.Product:
          task.progress += company.skill('productivity', workers, locations);
          task.obj.design += scale(company.skill('design', workers, locations));
          task.obj.marketing += scale(company.skill('marketing', workers, locations));
          task.obj.engineering += scale(company.skill('engineering', workers, locations));
          break;
        case Type.Promo:
          task.progress += company.skill('productivity', workers, locations);
          task.obj.hype += (scale(company.skill('marketing', workers, locations)) + scale(company.skill('design', workers, locations)/3)) * task.obj.power;
          break;
        case Type.Research:
          task.progress += company.skill('engineering', workers, locations) + company.skill('design', workers, locations)/3;
          break;
        case Type.Lobby:
          task.progress += company.skill('marketing', workers, locations, true);
          break;
        case Type.SpecialProject:
          task.obj.design += company.skill('design', workers, locations, true);
          task.obj.marketing += company.skill('marketing', workers, locations, true);
          task.obj.engineering += company.skill('engineering', workers, locations, true);
          break;
        case Type.Event:
          task.obj.design += scale(company.skill('design', workers, locations));
          task.obj.marketing += scale(company.skill('marketing', workers, locations));
          task.obj.engineering += scale(company.skill('engineering', workers, locations));
          break;
    }

    var finished = false;

    if (task.type === Type.SpecialProject) {
      finished = _.every(['design', 'marketing', 'engineering'], n => task.obj[n] >= task.obj.required[n]);
    } else {
      finished = task.progress >= task.requiredProgress;
    }

    if (finished) {
      this.finish(task, company);
      _.each(workers, w => this.unassign(w));
      _.each(locations, l => this.unassign(l));
      company.tasks = _.without(company.tasks, task);
      return true;
    }
    return false;
  },

  finish: function(task, company) {
    switch(task.type) {
      case Type.Product:
        var product = task.obj;
        if (product.killsPeople)
            company.deathToll += _.random(0, 10);

        if (product.debtsPeople)
            company.debtOwned += _.random(0, 10);

        if (product.pollutes)
            company.pollution += _.random(0, 10);

        if (product.recipeName != 'Default' &&
            !_.contains(company.discoveredProducts, product.recipeName)) {
          company.discoveredProducts.push(product.recipeName);
          if (product.effects) {
            Effect.applies(product.effects, company.player);
          }
        }

        company.productsLaunched++;
        Product.launch(product, company);
        break;

      case Type.Promo:
        // TODO some randomness for failures and big successes?
        company.hype += task.obj.hype;
        break;

      case Type.Research:
        var tech = task.obj;
        company.technologies.push(tech);
        Effect.applies(tech.effects, company.player);
        break;

      case Type.Lobby:
        var lobby = task.obj;
        company.lobbies.push(lobby);
        Effect.applies(lobby.effects, company.player);
        break;

      case Type.SpecialProject:
        var specialProject = task.obj;
        company.specialProjects.push(specialProject);
        Effect.applies(specialProject.effects, company.player);
        break;
      case Type.Event:
        // TODO
        break;
    }
  }
};

export default Task;