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

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 105">
  <g fill="#97C024" stroke="#97C024" stroke-linejoin="round" stroke-linecap="round">
    <path d="M14,40v24M81,40v24M38,68v24M57,68v24M28,42v31h39v-31z" stroke-width="12"/>
    <path d="M32,5l5,10M64,5l-6,10 " stroke-width="2"/>
  </g>
  <path d="M22,35h51v10h-51zM22,33c0-31,51-31,51,0" fill="#97C024"/>
  <g fill="#FFF">
    <circle cx="36" cy="22" r="2"/>
    <circle cx="59" cy="22" r="2"/>
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
