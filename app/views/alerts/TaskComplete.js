import _ from 'underscore';
import util from 'util';
import templ from '../Common';
import Task from 'game/Task';
import Alert from './Alert';

const basicTemplate = data => `
<div class="alert-message alert-task-complete alert-task-complete-${util.slugify(util.enumName(data.type, Task.Type))}" ${data.type == Task.Type.Lobby ? `style="background-image:url(${data.img})"`: ''}>
  <img src="assets/company/completed.png" class="alert-icon">
  <div class="title">
    <h3 class="subtitle">${data.typeName} Complete</h3>
    <h1>${data.name}</h1>
</div>
<figure>${data.type != Task.Type.Lobby ? `<img src="${data.img}">` : ''}</figure>
<div class="task-complete-info">
  <p>${data.description}</p>
  ${templ.effects(data)}
</div>
<div class="alert-actions">
  <button class="dismiss-alert">Ok</button>
</div>`;

const promoTemplate = data => `
<div class="alert-message alert-task-complete alert-task-complete-${util.slugify(util.enumName(data.type, Task.Type))}">
  <img src="assets/company/completed.png" class="alert-icon">
  <div class="title">
    <h3 class="subtitle">${data.typeName} Complete</h3>
    <h1>${data.name}</h1>
</div>
<figure><img src="${data.img}"></figure>
<div class="task-complete-info">
  <p>${data.description}</p>
  <div class="task-promo-results">
    ${data.success == 'major' ? 'The campaign went better than expected!' : ''}
    ${data.success == 'minor' ? 'The campaign didn\'t do as well as we\'d hoped...' : ''}
    ${Math.floor(data.hype)} more people are talking about us.
  </div>
</div>
<div class="alert-actions">
  <button class="dismiss-alert">Ok</button>
</div>`;

class TaskComplete extends Alert {
  constructor(task) {
    super({
      template: task.type == Task.Type.Promo ? promoTemplate : basicTemplate
    });
    this.task = task;
  }

  render() {
    var img, typeName, task = this.task;
    switch(task.type) {
      case Task.Type.Research:
        typeName = 'Research';
        img = `assets/techs/${util.slugify(task.obj.name)}.png`;
        break;
      case Task.Type.Lobby:
        typeName = 'Lobbying';
        img = `assets/lobbying/${util.slugify(task.obj.name)}.jpg`;
        break;
      case Task.Type.SpecialProject:
        typeName = 'Special Project';
        img = `assets/specialProjects/${util.slugify(task.obj.name)}.gif`;
        break;
      case Task.Type.Promo:
        typeName = 'Promo Campaign';
        img = `assets/promos/${util.slugify(task.obj.name)}.png`;
        break;
    }
    super.render(_.extend({
      img: img,
      typeName: typeName,
      type: this.task.type,
    }, this.task.obj));
  }
}

export default TaskComplete;
