/*
 * Agent
 * - an office entity that can move to targets
 */

import _ from 'underscore';
import Loader from './Loader';
import * as THREE from 'three';
import * as patrol from 'patroljs';

var STATE = {
      idle: 'idle',
      walking: 'walking',
      intransit: 'intransit',
      chatting: 'chatting',
      working: 'working',
    },
    MOVING_STATES = [STATE.walking, STATE.intransit],
    ENGAGED_STATES = [STATE.chatting, STATE.working, STATE.intransit],
    SCALE = 0.3,
    ACTION_CROSS_FADE = 0.1,
    MIN_ACTIVITY_TIME = 10,
    MAX_ACTIVITY_TIME = 20;


class Agent {
  constructor(data, object, spawnPos, office) {
    var self = this;
    this.type = data.type;
    this.model = data.model;
    this.baseSpeed = data.speed;
    this.object = object;
    this.office = office;
    this.scheduled = [];
    this.transit = null;
    this.loadMesh(spawnPos);
  }

  get yOffset() {
    var y = this.office.agent.yOffset;
    if (this.model && this.model.yOffset) {
      y += this.model.yOffset;
    }
    if (this.transit && this.transit.yOffset) {
      y += this.transit.yOffset
    }
    return y;
  }

  loadMesh(pos) {
    var self = this;
    Loader.loadSkinnedMesh(this.model.name, function(mesh, animations) {
      self.afterLoadMesh(mesh, animations, pos);
    });
  }

  afterLoadMesh(mesh, animations, pos) {
    this._setupMesh(mesh, pos, this.office.agent.scale);
    this._setupActions(this.mesh, animations);
    this.setState(STATE.idle);
    this.mesh.type = 'agent';
    this.mesh.object = this.object;
    this.office.scene.add(this.mesh);
    this.office.agents.push(this);
    this.office.selectables.push(this.mesh);
    this.doRandom();
  }

  setState(state) {
    this.state = state;
    this.moving = _.contains(MOVING_STATES, state);
    this.engaged = _.contains(ENGAGED_STATES, state);

    var actions = this.actions[state];
    if (actions) {
      var action = _.sample(actions);
      this.setAction(action);
      this._scheduleNextAction(actions);
    } else {
      // default to idle action
      this.setAction(this.actions[STATE.idle][0]);
    }
  }

  setAction(action) {
    action.enabled = true;
    action.play();
    if (this.action) {
      this.action.crossFadeTo(action, ACTION_CROSS_FADE);
    }
    this.action = action;
  }

  remove(office) {
    this.scheduled = [];
    this.mixer = null;
    if (this.usingObject) {
      this.usingObject.leave(this);
    }
    office.scene.remove(this.mesh);
  }

  goTo(targetPosition) {
    var self = this;
    if (this.office.navMeshGroup !== undefined) {
      this.transit = _.sample(this.office.transitOptions(this));
      if (this.transit.mesh) {
        var transitMesh = this.transit.mesh.clone();
        _.each(['rotation', 'position', 'scale'], function(attr) {
          var attrData = self.transit.model[attr];
          if (attrData) {
            transitMesh[attr].set(attrData[0], attrData[1], attrData[2]);
          }
        });
        this.mesh.position.y += this.transit.agentYOffset;
        this.mesh.add(transitMesh);
      }
      this.setState(STATE[this.transit.state]);
      var targetPos = {
        x: targetPosition.x,
        y: this.yOffset,
        z: targetPosition.z
      };
      this.currentTarget = targetPosition;
      this.currentTarget.parent.claim(this);

      this.path = patrol.findPath(
        this.mesh.position,
        targetPos,
        this.office.office,
        patrol.getGroup(this.office.office, this.mesh.position));
    }
  }

  schedule(callback, timeout) {
    var event = {
      callback: callback,
      timer: timeout
    }
    this.scheduled.push(event);
    return event;
  }

  tickScheduled(delta) {
    var completed = [];
    _.each(this.scheduled, function(scheduled) {
      scheduled.timer -= delta;
      if (scheduled.timer <= 0) {
        scheduled.callback();
        completed.push(scheduled);
      }
    });
    this.scheduled = _.difference(this.scheduled, completed);
  }

  doRandom() {
    var availableObjectPositions = _.chain(this.office.objects)
      .where({type: this.type})
      .map(function(obj) {
        return obj.vacantPositions;
      }).flatten().value();
    if (availableObjectPositions.length > 0) {
      this.goTo(_.sample(availableObjectPositions));
    }
  }

  tick(delta) {
    // add auxiliary agent behavior here
  }

  update(delta) {
    this.mixer.update(delta);
    this.tickScheduled(delta);

    this.tick(delta);
    if (this.path && this.path.length) {
      if (this.moving) {
        this.moveTowardsTarget(delta);
      }
    }
  }

  moveTowardsTarget(delta) {
    var self = this,
        target = this.path[0];
    target.y = this.yOffset;
    var vel = target.clone().sub(this.mesh.position);
    if (vel.lengthSq() > 0.05 * 0.05) {
      vel.normalize();
      this.mesh.position.add(vel.multiplyScalar(delta * this.transit.speed * this.baseSpeed));

      // if this is the last target, look towards the target's look point
      if (this.path.length == 1) {
        this.mesh.lookAt(new THREE.Vector3(
          this.currentTarget.lookPoint.x,
          this.yOffset,
          this.currentTarget.lookPoint.z));
      } else {
        this.mesh.lookAt(target);
      }
    } else {
      this.path.shift();

      // arrived
      if (!this.path.length) {
        if (this.transit.model) {
          var transitMesh = _.findWhere(this.mesh.children, {name: this.transit.model.name});
          if (transitMesh) {
            this.mesh.remove(transitMesh);
          }
        }
        this.useObject(this.currentTarget.parent);
      }
    }
  }

  useObject(obj) {
    var self = this;
    this.setState(obj.state);
    obj.use(self);
    self.onUse();
    this.usingObject = obj;
    this.schedule(function() {
      self.currentTarget = null;
      self.doRandom();
      obj.leave(self);
      self.onLeave();
      self.usingObject = null;
    }, _.random(MIN_ACTIVITY_TIME, MAX_ACTIVITY_TIME));
  }

  onUse() {}
  onLeave() {}

  _scheduleNextAction(actions) {
    if (this._scheduledAction) {
      this.scheduled = _.without(this.scheduled, this._scheduledAction);
    }
    if (actions.length > 1) {
      var self = this,
          duration = this.action._clip.duration + ACTION_CROSS_FADE/2;
      this._scheduledAction = this.schedule(function() {
        self.setAction(_.sample(actions));
      }, duration);
    }
  }

  _setupMesh(mesh, pos, scale) {
    var agentScale = this.model.scale || 1;
    this.mesh = mesh;
    this.mesh.scale.set(SCALE*scale*agentScale, SCALE*scale*agentScale, SCALE*scale*agentScale);
    this.mesh.position.set(pos.x, this.yOffset, pos.z);
  }

  _setupActions(mesh, animations) {
    this.actions = {};
    this.mixer = new THREE.AnimationMixer(mesh);
    _.each(animations, this._setupAction.bind(this));
  }

  _setupAction(anim) {
    var action = this.mixer.clipAction(anim);
    var actionName = anim.name.split('.')[0].toLowerCase();
    if (!(actionName in this.actions)) {
      this.actions[actionName] = [];
    }
    action.setEffectiveWeight(1);
    this.actions[actionName].push(action);
  }
}

Agent.STATE = STATE;
Agent.MIN_ACTIVITY_TIME = MIN_ACTIVITY_TIME;
Agent.MAX_ACTIVITY_TIME = MAX_ACTIVITY_TIME;
export default Agent;
