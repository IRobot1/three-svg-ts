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

<svg xmlns="http://www.w3.org/2000/svg" viewBox="-52 -53 100 100" stroke-width="2">
 <g fill="none">
  <ellipse stroke="#66899a" rx="6" ry="44"/>
  <ellipse stroke="#e1d85d" rx="6" ry="44" transform="rotate(-66)"/>
  <ellipse stroke="#80a3cf" rx="6" ry="44" transform="rotate(66)"/>
  <circle  stroke="#4b541f" r="44"/>
 </g>
 <g fill="#66899a" stroke="white">
  <circle fill="#80a3cf" r="13"/>
  <circle cy="-44" r="9"/>
  <circle cx="-40" cy="18" r="9"/>
  <circle cx="40" cy="18" r="9"/>
 </g>
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
