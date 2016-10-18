/*
 * Office
 * - the 3D view of the office
 * - has employees
 * - has perks (including agents and objekts)
 * - has non-perk objekts as well (e.g. chairs)
 */

import $ from 'jquery';
import _ from 'underscore';
import * as THREE from 'three';
import * as patrol from 'patroljs';
import Agent from './Agent';
import Loader from './Loader';
import Objekt from './Objekt';
import Employee from './Employee';
import OrbitControls from './Orbit';
import offices from 'data/offices.json';
import transit from 'data/office/transit.json';
import objects from 'data/office/objects.json';
import perkObjects from 'data/office/perkObjects.json';
import perkAgents from 'data/office/perkAgents.json';

const CAMERATYPE = 'persp'; // or 'ortho'

// preload transit meshes
_.each(transit, function(t) {
  if (t.model) {
    Loader.loadMesh(t.model.name, function(mesh) {
      t.mesh = mesh;
    });
  }
});

class Office {
  constructor(level, company, callback) {
    var self = this;
    this._setupScene();
    this.clock = new THREE.Clock();
    this.company = company;
    this.paused = false;

    this.setLevel(level, callback);
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  setLevel(level, callback) {
    var self = this;
    this.clear();
    this._setupLights();
    this.level = level;

    // keep track of objects to interact with
    this.selectables = [];
    this.employees = [];
    this.agents = [];

    _.extend(this, offices[level]);

    Loader.loadObject(this.name, function(obj) {
      self.scene.add(obj);

      self.objects = _.map(objects[self.name], function(obj) {
        var object = new Objekt(obj, self, obj);
        return object;
      });

      Loader.loadJSON(self.name + '_navmesh', function(geometry, materials) {
        var zoneNodes = patrol.buildNodes(geometry);
        patrol.setZoneData(self.level, zoneNodes);
        self.navMesh = geometry;

        // each level has only one group, so cache this
        self.navMeshGroup = patrol.getGroup(self.level, {x:0,y:0,z:0})

        if (callback) {
          callback(self);
        }
      });
    });
  }

  addPerk(perk) {
    var self = this,
        name = perk.name;
    if (perkAgents.hasOwnProperty(name)) {
      var agent = perkAgents[name],
          spawn = agent.offices[this.level].spawn,
          spawnPos = {x: spawn[0], y: this.agent.yOffset, z: spawn[1]};
      new Agent(agent, perk, spawnPos, this);
    } else if (perkObjects.hasOwnProperty(name)) {
      var perkObjs = perkObjects[name][this.level].objects;
      if (perkObjs) {
        _.each(perkObjs, function(obj) {
          self.objects.push(new Objekt(obj, self, perk));
        });
      }
    }
  }

  addEmployee(employee) {
    var spawnPoint = _.sample(this.spawnPoints);
    var employee = new Employee(
      employee,
      {
        x: spawnPoint[0],
        y: this.agent.yOffset,
        z: spawnPoint[1]
      }, this);
    this.employees.push(employee);
    return employee;
  }

  removeEmployee(employee) {
    var employee = _.find(this.employees, e => e.object.name == employee.name);
    this.employees = _.without(this.employees, employee);
    this.agents = _.without(this.agents, employee);
    employee.remove(this);
  }

  transitOptions(agent) {
    var perkNames = _.chain(this.company.perks).map(p => {
      return _.map(_.range(p.upgradeLevel + 1), i => p.upgrades[i]);
    }).flatten().pluck('name').value();
    return _.filter(transit, function(t) {
      return (!t.requires || _.contains(perkNames, t.requires))
        && _.contains(t.types, agent.type);
    });
  }

  updateObjectStats() {
    var company = this.company;
    _.each(this.objects, function(obj) {
      obj = obj.object;
      obj.statValues = {};
      _.each(obj.stats, function(v, k) {
        obj.statValues[k] = Math.floor(_.random(v[0], v[1]) * Math.sqrt(company.workers.length));
      });
    });
  }

  clear() {
    var self = this;
    for (var i = self.scene.children.length-1; i >= 0; i--) {
      var obj = self.scene.children[i];
      self.scene.remove(obj);
    }
  }

  render() {
    requestAnimationFrame(this.render.bind(this));
    if (!this.paused) {
      var delta = this.clock.getDelta();
      if (delta < 0.5) {
        // if the delta is really large,
        // (i.e. when the tab loses focus)
        // agents will take very large steps
        // and can end up off the map
        // so just ignore large deltas
        _.each(this.agents, function(agent) {
          agent.update(delta);
        });
      }
      this.renderer.render(this.scene, this.camera);
      this.controls.update();
    }
  }

  _setupScene() {
    var mainEl = document.getElementsByTagName('main')[0],
        width = $(mainEl).width(),
        height = $(mainEl).height(),
        aspect = width/height,
        D = 1;

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      canvas: document.getElementById('office')
    });
    this.renderer.setClearColor(0xffffff, 0);
    this.renderer.setSize(width, height);

    this.scene = new THREE.Scene();
    if (CAMERATYPE === 'persp') {
      this.camera = new THREE.PerspectiveCamera(45, aspect, .1, 20000);
      this.camera.zoom = 2;
    } else {
      this.camera = new THREE.OrthographicCamera(-D*aspect, D*aspect, D, -D, 1, 1000),
      camera.zoom = 0.08;
    }

    this.camera.position.set(-20, 20, 20);
    this.camera.lookAt(this.scene.position);
    this.camera.updateProjectionMatrix();

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.maxPolarAngle = Math.PI/2 - 0.1;
    if (CAMERATYPE === 'persp') {
      this.controls.minDistance = 10;
      this.controls.maxDistance = 50;
    } else {
      this.controls.maxZoom = 0.2;
      this.controls.minZoom = 0.1;
    }


    var self = this;
    window.addEventListener('resize', function() {
      var width = mainEl.clientWidth,
          height = mainEl.clientHeight;
      self.camera.aspect = width/height;
      self.camera.updateProjectionMatrix();
      self.renderer.setSize(width, height);
    }, false);
  }

  _setupLights() {
    var pointLight = new THREE.PointLight(0xffffff, 0.3, 50);
    pointLight.position.set(0, 20, 0);
    this.scene.add(pointLight);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    this.scene.add(new THREE.HemisphereLight(0xCCF0FF, 0xFFA1C7, 0.3));
  }
};

export default Office;
