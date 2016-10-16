/*
 * Task
 * - something that employees (includes workers and locations) are assigned to work on over time
 * - have a required progress, resolve once required progress is completed
 * - Product
 *   - is progressed with productivity
 *   - accumulates design, engineering, and marketing points (scaled by required progress)
 * - Lobby
 *   - is progressed with marketing
 *   - has company-wide effects
 * - Special Projects
 *   - is progressed with design, engineering, and marketing
 *   - has company-wide effects
 *   - requires discovered products (recipes)
 * - Research
 *   - is progressed with engineering and design
 *     - engineering has a greater influence than design
 *   - has company-wide effects
 *   - requires a particular vertical
 *   - may require other techs
 * - Promo
 *   - is progressed with productivity
 *   - accmulates hype from design and marketing (scaled by required progress)
 *     - marketing has a greater influence than design
 * - Event
 *   - has a fixed countdown (in weeks)
 *   - the Clock increments the progress accordingly
 *   - has some skill value that is accumulated
 * - the scaling for Product and Promo development is so players can't exploit low productivity employees with high skill values (which would lead to higher accumulated points than high productivity high skill value emplyees)
 */

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
  init: function(type, obj) {
    var task = {
      id: uuid(),
      type: Type[type],
      progress: 0,
      requiredProgress: obj.requiredProgress || 1,
      obj: obj
    };
    return task;
  },

  start: function(task, workers, locations) {
    _.each(workers, w => this.assign(task, w));
    _.each(locations, l => this.assign(task, l));
  },

  assign: function(task, worker) {
    worker.task = task.id;
  },

  unassign: function(worker) {
    worker.task = null;
  },

  workersForTask: function(task, company) {
    return _.filter(company.workers, w => w.task == task.id);
  },
  locationsForTask: function(task, company) {
    return _.filter(company.locations, l => l.task == task.id);
  },

  develop: function(task, company) {
    var workers = this.workersForTask(task, company),
        locations = this.locationsForTask(task, company),
        progressPerTick = company.skill('productivity', workers, locations),
        scale = function(skill) {
          return (skill/(task.requiredProgress/progressPerTick))/2;
        };

    switch (task.type) {
        case Type.Product:
          task.progress += company.skill('productivity', workers, locations);
          task.obj.design += scale(company.skill('design', workers, locations, true));
          task.obj.marketing += scale(company.skill('marketing', workers, locations, true));
          task.obj.engineering += scale(company.skill('engineering', workers, locations, true));
          break;
        case Type.Promo:
          task.progress += company.skill('productivity', workers, locations);
          task.obj.hype += (scale(company.skill('marketing', workers, locations)) + scale(company.skill('design', workers, locations)/3)) * Math.pow(task.obj.power, 3);
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
          task.progress = _.reduce(['design', 'marketing', 'engineering'], (m,n) => m + (task.obj[n]/task.obj.required[n]), 0)/3;
          break;
        case Type.Event:
          // event progress is incremented separately by the Clock, each week
          task.obj.skillVal += scale(company.skill(task.obj.required.skill, workers, locations));
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
      this.remove(task, company);
      return true;
    }
    return false;
  },

  tickEvent: function(task, company) {
    task.progress += 1;
    if (task.progress >= task.requiredProgress) {
      this.finish(task, company);
      this.remove(task, company);
    }
  },

  remove: function(task, company) {
    var workers = this.workersForTask(task, company),
        locations = this.locationsForTask(task, company);
    _.each(workers, w => this.unassign(w));
    _.each(locations, l => this.unassign(l));
    company.tasks = _.without(company.tasks, task);
  },

  finish: function(task, company) {
    switch(task.type) {
      case Type.Product:
        var product = task.obj;
        if (product.killsPeople)
            company.deathToll += _.random(2000, 10000);

        if (product.debtsPeople)
            company.debtOwned += _.random(2000, 10000);

        if (product.moralPanic)
            company.moralPanic += _.random(2000, 10000);

        if (product.pollutes)
            company.pollution += _.random(2000, 10000);

        if (product.recipeName != 'Default' &&
            !_.contains(company.discoveredProducts, product.recipeName)) {
          company.discoveredProducts.push(product.recipeName);
          if (product.effects) {
            Effect.applies(product.effects, company.player);
          }
          product.newDiscovery = true;
        }

        Product.launch(product, company);
        break;

      case Type.Promo:
        var hype = task.obj.hype;
        if (Math.random() < Promo.MAJOR_SUCCESS_PROB) {
          hype *= Promo.MAJOR_SUCCESS_MULT;
          task.obj.success = 'major';
        } else if (Math.random() < Promo.MINOR_SUCCESS_PROB) {
          hype *= Promo.MINOR_SUCCESS_MULT;
          task.obj.success = 'minor';
        }
        company.hype += hype;
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
        if (task.obj.skillVal >= task.obj.required.val) {
          if (task.obj.success.effects) {
            Effect.applies(task.obj.success.effects);
          }
          company.player.current.emails.push({
            'subject': `${task.obj.name} success!`,
            'from': '{{=it.cofounderSlug}}@{{=it.companySlug}}.com',
            'body': task.obj.success.body
          });
        } else {
          if (task.obj.failure.effects) {
            Effect.applies(task.obj.failure.effects);
          }
          company.player.current.emails.push({
            'subject': `${task.obj.name} failed...`,
            'from': '{{=it.cofounderSlug}}@{{=it.companySlug}}.com',
            'body': task.obj.failure.body
          });
        }
        break;
    }

    if (_.isFunction(this.onFinish)) {
      this.onFinish(task);
    }
  },
};

Task.Type = Type;
export default Task;