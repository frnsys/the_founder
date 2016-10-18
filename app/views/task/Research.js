import $ from 'jquery';
import _ from 'underscore';
import util from 'util';
import templ from '../Common';
import CardsList from 'views/CardsList';
import TaskAssignmentView from './Assignment';
import technologies from 'data/technologies.json';


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

const detailTemplate = item => `
  <div class="title">
    <h1>${item.name}</h1>
    <h4 class="cash">${util.formatCurrency(item.cost)}</h4>
  </div>
  <img src="assets/techs/${util.slugify(item.name)}.png">
  <h5 class="${item.has_vertical ? '': 'missing-vertical'}">Requires the ${item.requiredVertical} vertical</h5>
  ${item.prereqs.length > 0 ? templ.prereqs(item) : ''}
  ${templ.effects(item)}
  ${button(item)}
`;

class ResearchView extends CardsList {
  constructor(player) {
    super({
      title: 'Research',
      detailTemplate: detailTemplate,
      handlers: {
        '.buy': function(ev) {
          var idx = this.itemIndex(ev.target),
              sel = technologies[idx],
              task = player.company.startResearch(sel);
          if (task) {
            var view = new TaskAssignmentView(player, task);
            this.remove();
            view.render();
          };
        },
        '.toggle-filter': function() {
          this.showAll = !this.showAll;
          var text = this.showAll ? 'Show Available' : 'Show All';
          $('.toggle-filter').text(text);
        },
        '.toggle-completed': function() {
          this.showCompleted = !this.showCompleted;
          var text = this.showCompleted ? 'Hide Completed' : 'Show Completed';
          $('.toggle-completed').text(text);
        }
      }
    });
    this.showAll = false;
    this.showCompleted = false;
    this.player = player;
  }

  render() {
    this.items = _.map(technologies, t => {
      var item = this.processItem(t);
      item.cost *= this.player.costMultiplier * this.player.researchCostMultiplier;
      return item;
    });
    super.render({
      items: this.items
    });

    // hacky
    this.el.find('header').append('<div class="toggle-filter">Show All</div><div class="toggle-completed">Show Completed</div>');
  }

  update() {
    var self = this;
    _.each(_.zip(this.items, this.subviews), function(v, i) {
      var sv = v[1],
          item = self.processItem(v[0]);
      if (!_.isEqual(v[0], item)) {
        self.items[i] = item;
        v[1].el.find('button').replaceWith(button(item));
      }

      if (item.owned) {
        if (self.showCompleted) {
          sv.el.show();
        } else {
          sv.el.hide();
        }
      } else {
        if (self.showAll) {
          sv.el.show();
        } else if (item.not_available) {
          sv.el.hide();
        } else {
          sv.el.show();
        }
      }
    });

    this.el.find('.current-cash-value').text(
      `Cash: ${util.formatCurrency(this.player.company.cash)}`
    );
  }

  processItem(item) {
    var player = this.player,
        item = _.clone(item);
    return _.extend({
      owned: util.contains(this.player.company.technologies, item),
      afford: player.company.cash >= item.cost,
      not_available: !player.company.researchIsAvailable(item),
      in_progress: _.some(player.company.tasks, function(t) {
        return t.obj.name == item.name;
      }),
      prereqs: _.map(item.requiredTechs, function(t) {
        return {
          name: t,
          ok: util.containsByName(player.company.technologies, t)
        }
      }),
      has_vertical: util.containsByName(this.player.company.verticals, item.requiredVertical)
    }, item);
  }
}

export default ResearchView;
