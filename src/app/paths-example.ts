import { AmbientLight, AxesHelper, Color, PointLight, Scene } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";

import { ThreeJSApp } from "./threejs-app"
import { SVGShape } from "three-svg-js";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { showSVG } from "./showsvg";

export class PathsExample {

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

    const svgshape1 = new SVGShape({ width: 100, height: 100 })
      .path({ d: "M 10 10 H 90 V 90 H 10 L 10 10" })
      .circle({ cx: 10, cy: 10, r: 2, fill: 'red' })
      .circle({ cx: 90, cy: 90, r: 2, fill: 'red' })
      .circle({ cx: 90, cy: 10, r: 2, fill: 'red' })
      .circle({ cx: 10, cy: 90, r: 2, fill: 'red' })

    svgshape1.update()

    svgshape1.scale.set(0.01, -0.01, 0.01)
    svgshape1.center()

    svgshape1.position.set(-2, 0.5, 0)
    scene.add(svgshape1);

    const svgshape2 = new SVGShape({ width: 190, height: 160 })
      .path({ d: "M 10 10 C 20 20, 40 20, 50 10", stroke: 'black', fill: 'transparent' })
      .path({ d: "M 70 10 C 70 20, 110 20, 110 10", stroke: 'black', fill: 'transparent' })
      .path({ d: "M 130 10 C 120 20, 180 20, 170 10", stroke: 'black', fill: 'transparent' })
      .path({ d: "M 10 60 C 20 80, 40 80, 50 60", stroke: 'black', fill: 'transparent' })
      .path({ d: "M 70 60 C 70 80, 110 80, 110 60", stroke: 'black', fill: 'transparent' })
      .path({ d: "M 130 60 C 120 80, 180 80, 170 60", stroke: 'black', fill: 'transparent' })
      .path({ d: "M 10 110 C 20 140, 40 140, 50 110", stroke: 'black', fill: 'transparent' })
      .path({ d: "M 70 110 C 70 140, 110 140, 110 110", stroke: 'black', fill: 'transparent' })
      .path({ d: "M 130 110 C 120 140, 180 140, 170 110", stroke: 'black', fill: 'transparent' })
    //.path({ d: "M 10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80", stroke:'black', fill:'transparent'})
    //.path({ d: "M 10 80 Q 95 10 180 80", stroke:'black', fill:'transparent'})
    //.path({ d: "M 10 80 Q 52.5 10, 95 80 T 180 80", stroke:'black', fill:'transparent'})
    svgshape2.update()

    svgshape2.scale.set(0.01, -0.01, 0.01)
    svgshape2.center()

    svgshape2.position.set(-1, 0.5, 0)
    scene.add(svgshape2);

    const svgshape3 = new SVGShape({ width: 320, height: 320 })
      .path({
        d: `M 10 315
           L 110 215
           A 30 50 0 0 1 162.55 162.45
           L 172.55 152.45
           A 30 50 -45 0 1 215.1 109.9
           L 315 10`, stroke: 'black', fill: 'green', strokeWidth: 2, fillOpacity: 0.5
      })
    svgshape3.update()

    svgshape3.scale.set(0.005, -0.005, 0.005)
    svgshape3.center()

    svgshape3.position.set(1, 0.5, 0)
    scene.add(svgshape3);

    const svgshape4 = new SVGShape({ width: 325, height: 325 })
      .path({
        d: `M 80 80
           A 45 45, 0, 0, 0, 125 125
           L 125 80 Z`, fill: 'green'
      })
      .path({
        d: `M 230 80
           A 45 45, 0, 1, 0, 275 125
           L 275 80 Z`, fill: 'red'
      })
      .path({
        d: `M 80 230
           A 45 45, 0, 0, 1, 125 275
           L 125 230 Z`, fill: 'purple'
      })
      .path({
        d: `M 230 230
           A 45 45, 0, 1, 1, 275 275
           L 275 230 Z`, fill: 'blue'
      })
    svgshape4.update()

    svgshape4.scale.set(0.005, -0.005, 0.005)
    svgshape4.center()

    svgshape4.position.set(-1, 2, 0)
    scene.add(svgshape4);

    //     const loader = new SVGLoader();
    //     const svg = loader.parse(`
    //<svg width="200" height="250" version="1.1" xmlns="http://www.w3.org/2000/svg">

    //  <rect x="10" y="10" width="30" height="30" stroke="black" fill="transparent" stroke-width="5"/>
    //  <rect x="60" y="10" rx="10" ry="10" width="30" height="30" stroke="black" fill="transparent" stroke-width="5"/>

    //  <circle cx="25" cy="75" r="20" stroke="red" fill="transparent" stroke-width="5"/>
    //  <ellipse cx="75" cy="75" rx="20" ry="5" stroke="red" fill="transparent" stroke-width="5"/>

    //  <line x1="10" x2="50" y1="110" y2="150" stroke="orange" stroke-width="5"/>
    //  <polyline points="60 110 65 120 70 115 75 130 80 125 85 140 90 135 95 150 100 145"
    //      stroke="orange" fill="transparent" stroke-width="5"/>

    //  <polygon points="50 160 55 180 70 180 60 190 65 205 50 195 35 205 40 190 30 180 45 180"
    //      stroke="green" fill="transparent" stroke-width="5"/>

    //  <path d="M20,230 Q40,205 50,230 T90,230" fill="none" stroke="blue" stroke-width="5"/>
    //</svg>
    //     `);
    //     showSVG(scene, svg.paths)

    this.dispose = () => {
      orbit.dispose()
    }
  }
}
