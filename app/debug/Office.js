/*
 * Office Debugger
 * - renders hidden elements of the office view
 */

import _ from 'underscore';
import * as THREE from 'three';

class OfficeDebugger {
  constructor(office) {
    this.office = office;

    // better for editing
    this.office.controls.maxPolarAngle = Math.PI/2;
    this.office.controls.minDistance = 0; // persp
  }

  debug() {
    this.navMesh();
    _.each(this.office.spawnPoints, this.spawnPoint.bind(this));
    _.each(this.office.objects, this.object.bind(this));
  }

  spawnPoint(point) {
    var geometry = new THREE.CylinderGeometry(0, 0.1, 0.3, 6);
    var material = new THREE.MeshBasicMaterial({color: 0xFF9E9E, wireframe: true});
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(point[0], -0.1, point[1]);
    mesh.rotation.z = Math.PI;
    mesh.type = 'spawn';
    this.office.scene.add(mesh);
    this.office.selectables.push(mesh);
  }

  navMesh() {
    var material = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.2, color: 0x3195c8});
    var mesh = new THREE.Mesh(this.office.navMesh, material);
    this.office.scene.add(mesh);
  }

  object(obj) {
    _.each(obj.positions, this.objectPosition.bind(this));
  }

  objectPosition(pos) {
    // create target cone
    var geometry = new THREE.CylinderGeometry(0, 0.1, 0.6, 6);
    var material = new THREE.MeshNormalMaterial();
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(pos.x, pos.y, pos.z);
    mesh.rotation.z = Math.PI;
    mesh.type = 'target';
    mesh.pos = pos;
    pos.mesh = mesh;

    // create lookAt line
    var material = new THREE.LineBasicMaterial({
      color: 0x00ff00
    });

    var lookPoint = {
      x: pos.x + 0.5 * Math.sin(pos.orientation),
      z: pos.z + 0.5 * Math.cos(pos.orientation)
    }

    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(pos.x, pos.y, pos.z));
    geometry.vertices.push(new THREE.Vector3(lookPoint.x, pos.y, lookPoint.z));
    mesh.line = new THREE.Line(geometry, material);

    this.office.scene.add(mesh);
    this.office.scene.add(mesh.line);
    this.office.selectables.push(mesh);
  }

  employee(employee) {
    var material = new THREE.LineBasicMaterial({
      color: 0x0000ff
    });
    _.each(employee.rays, function(ray) {
      var geometry = new THREE.Geometry();
      geometry.vertices.push(new THREE.Vector3(0, 0, 0));
      geometry.vertices.push(ray);
      employee.mesh.add(new THREE.Line(geometry, material));
    });
  }
}

export default OfficeDebugger;
