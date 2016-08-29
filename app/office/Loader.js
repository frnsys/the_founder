/*
 * Loader
 * - loads objects, meshes, and textures
 */

import _ from 'underscore';
import * as THREE from 'three';

const MODELSDIR = '/assets/models/';
const meshLoader = new THREE.JSONLoader();
const objLoader = new THREE.ObjectLoader();
const texLoader = new THREE.TextureLoader();

function adjustMaterial(material, emit) {
  emit = emit || 0;
  material.shininess = 0;
  material.shading = THREE.FlatShading;
  material.map.generateMipmaps = false;
  material.map.magFilter = THREE.NearestFilter;
  material.map.minFilter = THREE.NearestFilter;
  if (emit) {
    material.emissiveIntensity = emit;
    material.emissive = {
      r: 0.45,
      g: 0.45,
      b: 0.45
    };
  }
}

function adjustMaterials(obj, emit) {
  if (obj.material) {
    if (obj.material.map) {
      adjustMaterial(obj.material, emit);
    } else if (obj.material.materials) {
      _.each(obj.material.materials, function(mat) {
        adjustMaterial(mat, emit);
      });
    }
  }
  _.each(obj.children, function(child) {
    adjustMaterials(child, emit);
  });
}

var Loader = {
  loadJSON: function(name, cb) {
    meshLoader.load(MODELSDIR + name + '.json', cb);
  },
  loadMesh: function(name, cb) {
    Loader.loadJSON(name, function(geometry, materials) {
      var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
      adjustMaterials(mesh, 0.35);
      mesh.name = name;
      cb(mesh);
    });
  },
  loadSkinnedMesh: function(name, cb) {
    Loader.loadJSON(name, function(geometry, materials) {
      _.each(materials, function(mat) {
        mat.skinning = true;
      });
      var mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials));
      adjustMaterials(mesh, 0);
      cb(mesh, geometry.animations);
    });
  },
  loadTexture: function(name, cb) {
    texLoader.load(MODELSDIR + name + '.png', function(tex) {
      cb(tex);
    });
  },
  loadObject: function(name, cb) {
    objLoader.load(MODELSDIR + name + '.json', function(obj) {
      adjustMaterials(obj, 0.5);
      cb(obj)
    });
  }
};

export default Loader;
