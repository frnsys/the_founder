import _ from 'underscore';
import dat from 'dat-gui';
import Debug from './Debug';
import Office from 'office/Office';
import SelectUI from 'office/Select';

const level = 0;
const stepSize = 0.01;
const objectPerks = ['Coffee', 'Butter Coffee', 'Bike Share', 'Employee Buses',
  'Cocktail Lounge', 'Microbrew Beers', 'On-Site Medical Facilities', 'Gene Therapy Lounges',
  'Office Keg', 'Snacks', 'Catering', 'Gourmet', 'Gym Memberships', 'Holiday Parties',
  'Fitness Trackers', 'Transit Stipends', 'Gym', 'Modafinil', 'Video Conferencing', 'Ping Pong',
  'Sleep Pods', 'Dream Workstations', 'Couches', 'Sugweyz', 'Hovercarts', 'VR Experience Veil'];
const agentPerks = ['Custodial Staff', 'Caretaker Automatons', 'Pupper', 'Doggo', 'Woofer', 'Yapper'];


function handleObject(gui, mesh) {
  var rotation = gui.addFolder('rotation');
  rotation.add(mesh.rotation, 'x').step(stepSize);
  rotation.add(mesh.rotation, 'y').step(stepSize);
  rotation.add(mesh.rotation, 'z').step(stepSize);
  rotation.open();

  var scale = gui.addFolder('scale');
  var scaleX = scale.add(mesh.scale, 'x').step(0.1);
  scaleX.onChange(function(value) {
    mesh.scale.y = value;
    mesh.scale.z = value;
  });
  scale.open();
}

function handleTarget(gui, mesh, px, py, pz) {
  var computeLookPoint = function() {
    return {
      x: mesh.pos.x + 0.5 * Math.sin(mesh.pos.orientation),
      z: mesh.pos.z + 0.5 * Math.cos(mesh.pos.orientation)
    }
  }

  var updateLine = function() {
    mesh.line.geometry.vertices[0] = mesh.position;
    mesh.pos.x = mesh.position.x;
    mesh.pos.y = mesh.position.y;
    mesh.pos.z = mesh.position.z;
    var lookPoint = computeLookPoint();
    mesh.line.geometry.vertices[1].x = lookPoint.x;
    mesh.line.geometry.vertices[1].z = lookPoint.z;
    mesh.line.geometry.verticesNeedUpdate = true;
  };

  gui.add(mesh.pos, 'name');

  px.onChange(updateLine);
  py.onChange(updateLine);
  pz.onChange(updateLine);
  var orientation = gui.add(mesh.pos, 'orientation').step(stepSize);
  orientation.onChange(function(val) {
    var lookPoint = computeLookPoint();
    mesh.line.geometry.vertices[1].x = lookPoint.x;
    mesh.line.geometry.vertices[1].z = lookPoint.z;
    mesh.line.geometry.verticesNeedUpdate = true;
  });

  var actions = {
    goTo: function() {
      var employee = _.sample(self.office.employees);
      // TODO this is probably broken
      employee.goTo(mesh.target.positions[mesh.index]);
    }
  };
  gui.add(actions, 'goTo');
}


const office = new Office(level, function() {
  _.each([0,1], function(type) {
    office.addEmployee(type);
  });
  _.each(objectPerks, office.addPerk.bind(office));
  _.each(agentPerks, office.addPerk.bind(office));
  Debug.debugOffice(office);

  var gui;
  var ui = new SelectUI(office, function(mesh) {
    if (gui) {
      gui.destroy();
    }
    gui = new dat.GUI();

    var position = gui.addFolder('position');
    var px = position.add(mesh.position, 'x').step(stepSize);
    var py = position.add(mesh.position, 'y').step(stepSize);
    var pz = position.add(mesh.position, 'z').step(stepSize);
    position.open();

    if (mesh.type === 'target') {
      handleTarget(gui, mesh, px, py, pz);
    } else if (mesh.type === 'object' || mesh.type === 'agent') {
      handleObject(gui, mesh);
    }
  });
});
office.render();
