import { AmbientLight, PointLight, Scene } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";

import { ThreeJSApp } from "./threejs-app"
import { SVGShape } from "three-svg-js";

export class GettingStartedExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    app.scene = scene

    app.camera.position.z = 4

    const orbit = new OrbitControls(app.camera, app.domElement);
    orbit.target.set(0, app.camera.position.y, 0)
    //orbit.enableRotate = false;
    orbit.update();

    const ambient = new AmbientLight()
    ambient.intensity = 0.1
    scene.add(ambient)

    const light = new PointLight(0xffffff, 1, 100)
    light.position.set(-1, 1, 2)
    light.shadow.bias = -0.001 // this prevents artifacts
    light.shadow.mapSize.width = light.shadow.mapSize.height = 512 * 2
    scene.add(light)

    //scene.add(new AxesHelper())

    const loader = new FontLoader();

    loader.load('assets/helvetiker_regular.typeface.json', (font: Font) => {
    const svgshape = new SVGShape({ width: 300, height: 200 })
      .rect({
        width: "100%",
        height: "100%",
        fill: "red"
      })
      .circle({ cx: 150, cy: 100, r: 80, fill: "green" })
      .text({
        content: "SVG",
        font,
        x: "150",
        y: "125",
        fontSize: 60,
        textAnchor: "middle",
        fill: "white"
      })
      svgshape.update()
      console.warn(svgshape)
      svgshape.scale.setScalar(0.01)
      scene.add(svgshape);
    })

    // const loader = new SVGLoader();
    // const svg = loader.parse(`
    // <svg version="1.1"
    //      width="300" height="200"
    //      xmlns="http://www.w3.org/2000/svg">

    //   <rect width="100%" height="100%" fill="red" />

    //   <circle cx="150" cy="100" r="80" fill="green" />

    //   <text x="150" y="125" font-size="60" text-anchor="middle" fill="white">SVG</text>

    // </svg>`);
    //     showSVG(scene, svg.paths)



    this.dispose = () => {
      orbit.dispose()
    }
  }
}
