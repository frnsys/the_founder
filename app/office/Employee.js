/*
 * Employee
 * - agent representing a company employee
 */

import $ from 'jquery';
import _ from 'underscore';
import Agent from './Agent';
import Loader from './Loader';
import * as THREE from 'three';

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

    if (this.path && this.path.length) {
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

    this.updateThoughtPosition();

    // show burntout icon
    if (this.object.burnout > 0 && !this.burntoutIcon) {
      this.showBurntout();
    } else if (this.object.burnout == 0 && this.burntoutIcon) {
      this.mesh.material.materials[0].color.set(0xffffff);
      this.burntoutIcon.remove();
    }
    this.updateBurntoutPosition();
  }

  get burntoutIcon() {
    var icon = $(`[data-employee="${this.object.name}"`);
    if (icon.length > 0) {
      return icon[0];
    }
  }

  get abovePosition() {
    if (this.mesh) {
      var pos = new THREE.Vector3();
      pos.setFromMatrixPosition(this.mesh.matrixWorld);
      pos.y += 1; // a little y offset
      return toXYCoords(pos, this.office.camera);
    }
  }

  showThought(text) {
    var thought = document.createElement('div');
    thought.innerHTML = text;
    thought.className = 'employee-thought';
    document.body.appendChild(thought);
    this.thought = thought;
    this.updateThoughtPosition();

    var self = this;
    setTimeout(function() {
      self.thought.remove();
      self.thought = null;
    }, 5000);
  }

  showBurntout() {
    var burntout = document.createElement('img');
    burntout.src = 'assets/company/burntout.png';
    burntout.className = 'employee-burntout';
    burntout.dataset.employee = this.object.name;
    document.body.appendChild(burntout);
    this.updateBurntoutPosition();
    this.mesh.material.materials[0].color.set(0x666666);
  }

  updateThoughtPosition() {
    if (this.thought) {
      var pos = this.abovePosition;
      if (pos) {
        this.thought.style.top = pos.y + 'px';
        this.thought.style.left = pos.x + 'px';
      }
    }
  }

  updateBurntoutPosition() {
    if (this.burntoutIcon) {
      var pos = this.abovePosition;
      if (pos) {
        this.burntoutIcon.style.top = pos.y + 'px';
        this.burntoutIcon.style.left = pos.x + 'px';
      }
    }
  }

  remove(office) {
    super.remove(office);
    if (this.burntoutIcon) {
      this.burntoutIcon.remove();
    }
    if (this.thought) {
      this.thought.remove();
    }
  }
}

function toXYCoords(pos, camera) {
  var vector = pos.clone().project(camera);
  vector.x = (vector.x + 1)/2 * $('main').width();
  vector.y = -(vector.y - 1)/2 * $('main').height();
  return vector;
}

Employee.types = TYPES;
export default Employee;
