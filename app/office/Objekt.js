/*
 * Objekt
 * - a static but interactable object in the office
 * - has some set of positions
 *   - each can be occupied by a single agent
 * - named such to avoid conflict with JS's Object
 */

import _ from 'underscore';
import Loader from './Loader';

var LOOKAT_RADIUS = 0.06; // radius from target pos to look point


function nameFromObject(obj) {
  if (obj.name.includes('chair')) {
    return 'Desk';
  } else if (obj.name.includes('couch')) {
    return 'Couch';
  } else {
    return obj.name;
  }
}

function descFromObject(obj) {
  switch (obj.name) {
    case 'Desk':
      return 'The centerpiece of the workplace';
    case 'Couch':
      return 'A spot to crash for a bit';
    default:
      return obj.description;
  }
}


function statsFromObject(obj) {
  switch (obj.name) {
    case 'Desk':
      return {
        'Lines of code written': [0, 200],
        'Emails sent': [0, 42],
        'Pixels pushed': [0, 2000]
      };
    case 'Couch':
      return {
        'Hours napped': [0,3]
      };
    default:
      return obj.stats;
  }
}


class Objekt {
  constructor(data, office, object) {
    var self = this;
    this.name = data.name;
    this.type = data.type;
    this.state = data.state;
    this.office = office;
    this.object = object;

    this.positions = _.map(data.positions, function(p, i) {
      var position = {
        x: p.x,
        y: 0.02, // arbitrary, employees ignore this
        z: p.z,
        occupied: false,
        orientation: p.orientation,
        parent: self,
        name: self.name + '_' + i,
        noMax: p.no_max ? p.no_max : false,
        interactive: p.interactive ? p.interactive : false
      };
      self.updateLookPoint(position);
      return position;
    });

    if (data.model) {
      this._loadModel(data.model, function(mesh) {
        self.mesh = mesh;
        self.mesh.object = self.object;
        self.office.selectables.push(mesh);
      });
    }
    self.object.name = nameFromObject(self.object);
    self.object.description = descFromObject(self.object);
    self.object.stats = statsFromObject(self.object);
}

  updateLookPoint(pos) {
    pos.lookPoint = {
      x: pos.x + LOOKAT_RADIUS * Math.sin(pos.orientation),
      z: pos.z + LOOKAT_RADIUS * Math.cos(pos.orientation)
    };
  }

  get vacantPositions() {
    return _.where(this.positions, {occupied:false})
  }

  claim(agent) {
    var pos = _.sample(this.vacantPositions);
    if (!pos.noMax) {
      pos.occupied = true;
    }
    pos.user = agent;
  }

  use(agent) {
    var pos = _.findWhere(this.positions, {user: agent});
    if (pos && pos.interactive) {
      var intdata = pos.interactive;
      if (intdata.invisible) {
        agent.mesh.visible = false;
      } else if (this.mesh) {
        pos._cachedAgentData = {
          position: _.clone(agent.mesh.position),
          rotation: _.clone(agent.mesh.rotation),
          scale: _.clone(agent.mesh.scale)
        }
        this.mesh.add(agent.mesh);
        _.each(['rotation', 'position', 'scale'], function(attr) {
          if (intdata[attr]) {
            agent.mesh[attr].set(intdata[attr][0], intdata[attr][1], intdata[attr][2]);
          }
        });
      }

      if (intdata.model) {
        if (pos._mesh) {
          pos._mesh.visible = true;
        } else {
          this._loadModel(intdata.model, function(mesh) {
            pos._mesh = mesh;
          });
        }
      }
    }
  }

  leave(agent) {
    var pos = _.findWhere(this.positions, {user: agent});
    if (pos) {
      pos.user = null;
      pos.occupied = false;
      if (pos.interactive) {
        var intdata = pos.interactive;
        if (intdata.invisible) {
          agent.mesh.visible = true;
        } else if (this.mesh) {
          intdata = pos._cachedAgentData;
          this.office.scene.add(agent.mesh);
          _.each(['rotation', 'position', 'scale'], function(attr) {
            if (intdata[attr]) {
              agent.mesh[attr].set(intdata[attr].x, intdata[attr].y, intdata[attr].z);
            }
          });
          pos._cachedAgentData = null;
        }

        if (pos._mesh) {
          pos._mesh.visible = false;
        }
      }
    }
  }

  _loadModel(model, cb) {
    var self = this;
    Loader.loadMesh(model.name, function(mesh) {
      _.each(['rotation', 'position', 'scale'], function(attr) {
        if (model[attr]) {
          mesh[attr].set(model[attr][0], model[attr][1], model[attr][2]);
        }
      });
      mesh.type = 'object';
      self.office.scene.add(mesh);
      cb(mesh);
    });
  }
}

export default Objekt;
