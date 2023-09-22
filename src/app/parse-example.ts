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

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle stroke-width="12" r="43" cx="50" cy="50" fill="none" stroke="#3A5"/>
  <circle r="6" cx="59" cy="23" fill="#000"/>
  <g stroke-linejoin="round" stroke-linecap="round" stroke-width="1" stroke="#000" fill="none">
    <path d="M36,36c5,0,3,2,8-1c1,2,1,3,3,2c3,0-6,7-3,8c-4-2-9,2-14-2c4-3,4-4,5-7c5,0,8,2,12,1"/>
    <path fill="#000" d="M34,29h31c2,5,7,10,7,16l-8,1l8,1l-3,31l-5,-18l-11,18l5-34l-3-8z"/>
    <path stroke-width="2" d="M27,48h23M28,49h21l-3,28h-14l-4,-28h5l3,28h3v-28h5l-2,28m3-4h-13m-1-5h16m0-5h-16m-1-5h18m0-5h-19"/>
  </g>
  <path stroke="#F00" stroke-width="1"/>
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
