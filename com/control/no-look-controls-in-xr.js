// look-controls turns off autoUpdateMatrix (of player) which 
// will break repositionining the VR rig (teleporting and other stuff)
// overriding this below is easier then adding updateMatrixWorld() everywhere else
// (or rolling your own look-controls and diverting from mainbranch)

AFRAME.registerComponent('patch-look-controls',{

  init: function(){
    alert("fjo"); //dEventListener('loaded', () => this.patchLookControls() )
  },

  patchLookControls: function(){
alert("ja!")
    let lk = document.querySelector('[look-controls]')
    if( !lk ) return 
    lk = lk.components['look-controls']
    
    lk.onEnterVR = function () {
      var sceneEl = this.el.sceneEl;
      if (!sceneEl.checkHeadsetConnected()) { return; }
      this.saveCameraPose();
      this.el.object3D.position.set(0, 0, 0);
      this.el.object3D.rotation.set(0, 0, 0);
      if (sceneEl.hasWebXR) {
       // this.el.object3D.matrixAutoUpdate = false;
        this.el.object3D.updateMatrix();
      }
    }

    /**
     * Restore the pose.
     */
    lk.onExitVR = function () {
      if (!this.el.sceneEl.checkHeadsetConnected()) { return; }
      this.restoreCameraPose();
      this.previousHMDPosition.set(0, 0, 0);
      this.el.object3D.matrixAutoUpdate = true;
    }

    // it also needs to apply the offset (in case the #rot was used in URLS)

    lk.updateOrientation = function () {
      var object3D = this.el.object3D;
      var pitchObject = this.pitchObject;
      var yawObject = this.yawObject;
      var sceneEl = this.el.sceneEl;

      // In VR or AR mode, THREE is in charge of updating the camera pose.
      if ((sceneEl.is('vr-mode') || sceneEl.is('ar-mode')) && sceneEl.checkHeadsetConnected()) {
        // With WebXR THREE applies headset pose to the object3D internally.
        return;
      }

      this.updateMagicWindowOrientation();

      let offsetX = object3D.rotation.offset ? object3D.rotation.offset.x : 0
      let offsetY = object3D.rotation.offset ? object3D.rotation.offset.y : 0 

      // On mobile, do camera rotation with touch events and sensors.
      object3D.rotation.x = this.magicWindowDeltaEuler.x + offsetX + pitchObject.rotation.x;
      object3D.rotation.y = this.magicWindowDeltaEuler.y + offsetY + yawObject.rotation.y;
      object3D.rotation.z = this.magicWindowDeltaEuler.z;
      object3D.matrixAutoUpdate = true
    }

  }
})
