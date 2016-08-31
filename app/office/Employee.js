/*
 * Employee
 * - agent representing a company employee
 */

import _ from 'underscore';
import Agent from './Agent';
import Loader from './Loader';

var STATE = Agent.STATE,
    TYPES = ['human', 'human2', 'human3',
            'human4', 'human5', 'human6',
            'human7', 'human8', 'human9', 'robot'],
    CHAT_RADIUS = 0.2,
    MIN_CHAT_RADIUS = 0.1,
    CHAT_PROB = 0.2,
    CHAT_COOLDOWN = 10;

class Employee extends Agent {
  constructor(employee, spawnPos, office) {
    super({
      type: 'employee',
      model: {
        name: 'worker',
        scale: 1,
        yOffset: 0
      },
      speed: 1
    }, employee, spawnPos, office);
    this.workerType = employee.avatar;
    this.chatCooldown = CHAT_COOLDOWN;
  }

  loadMesh(pos) {
    var self = this;
    Loader.loadSkinnedMesh('worker', function(mesh, animations) {
      Loader.loadTexture(TYPES[self.workerType], function(tex) {
        mesh.material.materials[0].map = tex;
        self.afterLoadMesh(mesh, animations, pos);
        self.office.employees.push(self);
        self.mesh.type = 'employee';
      });
    });
  }

  chatWith(employee) {
    var self = this;
    this.chatCooldown = CHAT_COOLDOWN;

    this.setState(STATE.chatting);
    employee.setState(STATE.chatting);
    this.mesh.lookAt(employee.mesh.position);
    employee.mesh.lookAt(this.mesh.position);

    this.schedule(function() {
      self.setState(STATE.walking);
      employee.setState(STATE.walking);
    }, _.random(Agent.MIN_ACTIVITY_TIME, Agent.MAX_ACTIVITY_TIME));
  }

  isNearby(employee) {
    var distance = Math.pow(employee.mesh.position.x - this.mesh.position.x, 2) +
      Math.pow(employee.mesh.position.y - this.mesh.position.y, 2);
    var inRange = distance < Math.pow(CHAT_RADIUS, 2);
    var tooClose = distance < Math.pow(MIN_CHAT_RADIUS, 2);
    return inRange && !tooClose;
  }

  get freeToChat() {
    return !this.engaged && this.chatCooldown <= 0;
  }

  tick(delta) {
    var self = this;
    // chatting
    if (!this.engaged && this.chatCooldown <= 0 && Math.random() < CHAT_PROB) {
      var nearby = _.find(this.office.employees, function(employee) {
        return employee != self && self.isNearby(employee) && employee.freeToChat;
      });
      if (nearby) {
        this.chatWith(nearby);
      }
    } else if (this.state !== STATE.chatting) {
      this.chatCooldown = Math.max(0, this.chatCooldown-delta);
    }
  }
}

Employee.types = TYPES;
export default Employee;
