import * as THREE from 'three';

class SelectUI {
  constructor(office, onSelect) {
    this.office = office;
    this.onSelect = onSelect;
    this.mouse = new THREE.Vector2();

    office.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
    office.renderer.domElement.addEventListener('touchstart', this.onTouchStart.bind(this), false);
  }

  onTouchStart(ev) {
    ev.preventDefault();
    ev.clientX = ev.touches[0].clientX;
    ev.clientY = ev.touches[0].clientY;
    this.onMouseDown(ev);
  }

  onMouseDown(ev) {
    ev.preventDefault();

    // adjust browser mouse position for three.js scene
    this.mouse.x = (ev.clientX/this.office.renderer.domElement.clientWidth) * 2 - 1;
    this.mouse.y = -(ev.clientY/this.office.renderer.domElement.clientHeight) * 2 + 1;

    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(this.mouse, this.office.camera);

    var intersects = raycaster.intersectObjects(this.office.selectables);
    if (intersects.length > 0) {
      var obj = intersects[0].object;
      this.onSelect(obj);
    }
  }
}

export default SelectUI;
