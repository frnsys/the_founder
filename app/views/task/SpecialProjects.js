import _ from 'underscore';
import util from 'util';
import templ from '../Common';
import CardsList from 'views/CardsList';
import TaskAssignmentView from './Assignment';
import specialProjects from 'data/specialProjects.json';

function button(item) {
  if (item.in_progress) {
    return '<button disabled>In Progress</button>';
  } else if (item.owned) {
    return '<button disabled>Completed</button>';
  } else if (item.not_available) {
    return '<button disabled>Missing prerequisites</button>';
  } else if (item.afford) {
    return '<button class="buy">Start</button>';
  } else {
    return '<button disabled>Not enough cash</button>';
  }
}

function detailTemplate(item) {
  if (item.unlocked) {
    return `
      <div class="title">
        <h1>${item.name}</h1>
        <h4 class="cash">${util.formatCurrencyAbbrev(item.cost)}</h4>
      </div>
      <img src="assets/specialProjects/${util.slugify(item.name)}.gif">
      <p>${item.description}</p>
      ${templ.effects(item)}
      ${item.prereqs.length > 0 ? templ.prereqs(item, 'Required Products') : ''}
      ${button(item)}
    `;
  } else {
    return `
      <div class="title">
        <h1>???</h1>
      </div>
      <img src="assets/placeholder.gif">
      <div class="undiscovered">
        <p>This special project is yet to be discovered.</p>
        ${item.prereqs.length > 0 ? templ.prereqs(item, 'Required Products') : ''}
      </div>
    `;
  }
}


class View extends CardsList {
  constructor(player) {
    super({
      title: 'Special Projects',
      detailTemplate: detailTemplate,
      handlers: {
        '.buy': function(ev) {
          var idx = this.itemIndex(ev.target),
              sel = specialProjects[idx],
              task = player.company.startSpecialProject(sel);
          if (task) {
            var view = new TaskAssignmentView(player, task);
            this.remove();
            view.render();
          };
        }
      }
    });
    this.player = player;
  }

  render() {
    this.items = _.map(specialProjects, sp => {
      var item = this.processItem(sp);
      item.cost *= this.player.costMultiplier;
      return item;
    });
    super.render({
      items: this.items
    });
  }

  update() {
    var self = this;
    _.each(_.zip(this.items, this.subviews), function(v, i) {
      var item = self.processItem(v[0]);
      if (item.unlocked && !_.isEqual(v[0], item)) {
        self.items[i] = item;
        v[1].el.find('button').replaceWith(button(item));
      }
    });

    this.el.find('.current-cash-value').text(
      `Cash: ${util.formatCurrency(this.player.company.cash)}`
    );
  }

  processItem(item) {
    var player = this.player,
        item = _.clone(item);
    return _.extend(item, {
      owned: util.contains(player.company.specialProjects, item),
      unlocked: _.contains(player.unlocked.specialProjects, item.name),
      afford: player.company.cash >= item.cost,
      in_progress: _.some(player.company.tasks, function(t) {
        return t.obj.name == item.name;
      }),
      not_available: !player.company.specialProjectIsAvailable(item),
      prereqs: _.map(item.requiredProducts, function(p) {
        return {
          name: p,
          ok: util.containsByName(player.company.discoveredProducts, p)
        }
      })
    });
  }
}

export default View;

