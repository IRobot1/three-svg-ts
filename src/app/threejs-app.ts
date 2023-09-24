import { Camera, PerspectiveCamera, Scene, WebGLRenderer, WebGLRendererParameters } from "three";
import { UIRouter } from "./ui-routes";

export interface renderState { scene: Scene, camera: Camera, renderer: WebGLRenderer }

export class ThreeJSApp extends WebGLRenderer {
  public camera!: Camera;

  //public router = new UIRouter()

  constructor(p?: WebGLRendererParameters, public parent?: any, public scene?: Scene, camera?: Camera) {
    super()

    //this.router.addEventListener('load', () => {
    //  this.camera.position.set(0, 0, 0)
    //  this.camera.rotation.set(0, 0, 0)
    //})

    if (!camera) {
      this.camera = new PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
    }
    else
      this.camera = camera

    let container: () => { width: number, height: number }
    if (!parent) {
      this.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(this.domElement);
      container = () => { return { width: window.innerWidth, height: window.innerHeight } }
    }
    else {
      this.setSize(parent.clientWidth, parent.clientHeight);
      parent.appendChild(this.domElement);
      container = () => { return { width: parent.clientWidth, height: parent.clientHeight } }
    }

    this.shadowMap.enabled = true;

    window.addEventListener('resize', () => {
      const { width, height } = container()

      this.setSize(width, height);

      if (this.camera.type == 'PerspectiveCamera') {
        const perspective = this.camera as PerspectiveCamera
        perspective.aspect = width / height;
        perspective.updateProjectionMatrix();
      }
    });


    const animate = () => {
      requestAnimationFrame(animate);
      if (!this.scene) return

      const scene = this.scene

      this.render(scene, this.camera);

    };

    animate()
  }

  // short-cut
  //navigateto(route: string) {
  //  this.router.navigateto(route)
  //}


}
