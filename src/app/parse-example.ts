import { AmbientLight, Color, PointLight, Scene } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { ThreeJSApp } from "./threejs-app"
import { SVGParser, SVGShape } from "three-svg-js";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import { showSVG } from "./showsvg";
import { BaseShape } from "../../projects/three-svg-js/src/lib/baseshape";
import { TextShape } from "../../projects/three-svg-js/src/lib/textshape";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";

export class SVGParseExample {

  dispose = () => { }

  constructor(app: ThreeJSApp) {

    const scene = new Scene()
    scene.background = new Color().setStyle('#666')
    app.scene = scene

    app.camera.position.z = 2

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

    const text = `

<svg id='svg1' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
  <circle r="32" cx="35" cy="65" fill="#F00" opacity="0.5"/>
  <circle r="32" cx="65" cy="65" fill="#0F0" opacity="0.5"/>
  <circle r="32" cx="50" cy="35" fill="#00F" opacity="0.5"/>
</svg>

















    `
    const parser = new SVGParser()
    const schema = parser.parse(text)
    console.warn(schema)

    const loader = new FontLoader();
    loader.load('assets/helvetiker_regular.typeface.json', (font: Font) => {
      const svgshape2 = new SVGShape()
      svgshape2.load(schema)

      svgshape2.traverse(object => {
        const shape = object as BaseShape
        if (shape.shapetype == 'text') {
          (shape as TextShape).font = font
        }
      })
      svgshape2.update()

      svgshape2.scale.setScalar(0.01)
      svgshape2.position.set(-1.5, 0.5, 0)
      scene.add(svgshape2);
    })

    const svg = new SVGLoader().parse(text);
    const group = showSVG(scene, svg.paths)
    group.scale.set(0.01, -0.01, 1)
    group.position.set(0.5, 0.5, 0)


    this.dispose = () => {
      orbit.dispose()
    }
  }
}
