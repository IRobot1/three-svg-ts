import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ThreeJSApp } from './threejs-app';
import { GettingStartedExample } from './getting-started-example';
import { BasicShapesExample } from './basic-shapes';
import { PathsExample } from './paths-example';
import { StrokesExample } from './strokes-example';
import { GradientsExample } from './gradient-example';
import { TextExample } from './text-example';
import { GroupExample } from './group-example';
import { SVGParseExample } from './parse-example';
import { AmbientLight, Color, PointLight, Scene, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { SVGParser, SVGShape } from 'three-svg-js';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { BaseShape } from '../../projects/three-svg-js/src/lib/baseshape';
import { TextShape } from '../../projects/three-svg-js/src/lib/textshape';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import { showSVG } from './showsvg';
import { EditorComponent } from 'ngx-monaco-editor-v2';
import { Exporter } from './exporter';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements AfterViewInit {
  title = 'three-svg-ts'
  showMultiple = true
  codeInput: string | undefined = ''
  jsonoptions = {
    theme: 'vs-dark',
    language: 'json',
    "readOnly": true
  };
  jsoncode: string | undefined
  svgoptions = {
    theme: 'vs-dark',
    language: 'xml',
    "autoIndent": true,
    "formatOnPaste": true,
    "formatOnType": true
  };
  svgcode: string = `
<svg xmlns="http://www.w3.org/2000/svg" stroke-linejoin="round" viewBox="0 0 100 100">
  <path d="M50,4L4,50L50,96L96,50Z" stroke="#FE4" stroke-width="3"/>
  <path d="M50,5L5,50L50,95L95,50Z" stroke="#333" fill="#FE4" stroke-width="3"/>
  <g transform="scale(0.8) translate(14,30)">
    <path d="M37,42c-1,0,11-20,13-20c1,0,15,20,13,20h-9c0,8,9,22,12,25l-4,4l-8,-7v13h-10v-35z" stroke="#CA0" fill="#CA0"/>
    <path d="M35,40c-1,0,11-20,13-20c1,0,15,20,13,20h-9c0,8,9,22,12,25l-4,4l-8,-7v13h-10v-35z" stroke="#333" fill="#555"/>
  </g>
 <g transform="translate(50,26) scale(0.25)" stroke-width="2">
   <g fill="none">
    <ellipse stroke="#469" rx="6" ry="44"/>
    <ellipse stroke="#ba5" rx="6" ry="44" transform="rotate(-66)"/>
    <ellipse stroke="#68c" rx="6" ry="44" transform="rotate(66)"/>
    <circle  stroke="#331" r="44"/>
   </g>
   <g fill="#689" stroke="#FE4">
    <circle fill="#80a3cf" r="13"/>
    <circle cy="-44" r="9"/>
    <circle cx="-40" cy="18" r="9"/>
    <circle cx="40" cy="18" r="9"/>
   </g>
 </g>
 </svg>  `

  @ViewChild('test') test!: ElementRef<HTMLDivElement>;

  app!: ThreeJSApp
  scene!: Scene

  ngAfterViewInit(): void {
    this.app = new ThreeJSApp({}, this.test.nativeElement)

    const scene = new Scene()
    scene.background = new Color().setStyle('#666')
    this.app.scene = scene

    this.app.camera.position.z = 6

    const orbit = new OrbitControls(this.app.camera, this.app.domElement);
    orbit.target.set(0, this.app.camera.position.y, 0)
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

    this.scene = scene

    //scene.add(new AxesHelper())



    this.parser = new SVGParser()
    this.parser.log = (message: any, ...optionalParams: any[]) => {
      console.warn(message, optionalParams)
    }

    const loader = new FontLoader();
    loader.load('assets/helvetiker_regular.typeface.json', (font: Font) => {
      this.font = font
    })

    this.updateCanvas(this.svgcode)

  }

  parser!: SVGParser
  font!: Font

  updateCanvas(svg: string) {
    const schema = this.parser.parse(svg)
    console.warn(schema)
    const timer = setTimeout(() => {
      this.jsoncode = JSON.stringify(schema, undefined, 1)
      clearTimeout(timer)
    }, 100)

    const svgshape = new SVGShape(schema.options)
    svgshape.load(schema)

    svgshape.traverse(object => {
      const shape = object as BaseShape
      if (shape.shapetype == 'text') {
        (shape as TextShape).font = this.font
      }
    })
    try {
      svgshape.update()
    }
    catch (e) {
      console.error(e)
    }

    svgshape.scale.set(0.01, -0.01, 0.01)
    const box = svgshape.center()

    const size = new Vector3()
    box.getSize(size)
    const max = Math.max(Math.abs(size.x), Math.abs(size.y))
    // adjust camera so object fits into fov
    this.app.camera.position.z = max

    //const helper = new AxesHelper()
    //scene.add(helper)
    //helper.add(svgshape2)

    this.scene.add(svgshape);
    this.svgshape = svgshape
    //console.warn(svgshape2)

    //const result = new SVGLoader().parse(svg);
    //const group = showSVG(this.scene, result.paths)
    //group.scale.set(0.01, -0.01, 1)
    //group.position.set(-0.5, 0.5, 0)
  }

  private svgshape?: SVGShape
  private timeoutId: any

  svgchanged(svg: string) {
    clearTimeout(this.timeoutId);

    // Start a new timeout after 1 second
    this.timeoutId = setTimeout(() => {
      this.scene.children.length = 0
      this.updateCanvas(svg)
      clearTimeout(this.timeoutId);
    }, 500);

  }

  filename: string | undefined

  copyToCloud(list: FileList | null) {
    if (!list) return
    if (list.length == 0) return
    const file = list[0]
    this.filename = file.name

    const reader = new FileReader();
    reader.readAsText(file);
    reader.onloadend = () => {
      this.svgcode = reader.result as string
    };
  }

  saveJSON() {
    let filename = this.filename
    if (!this.filename)
      filename = new Date().getTime() + '.json';
    else
      filename = this.filename.replace('.svg','.json')
    const ex = new Exporter();
    ex.saveString(this.jsoncode!, filename)
  }

  saveGLTF() {
    if (!this.svgshape) return

    let filename = this.filename
    if (!this.filename)
      filename = new Date().getTime().toString()
    else
      filename = this.filename.replace('.svg','')
    const ex = new Exporter();
    ex.exportGLTF(this.svgshape,filename,false)
  }
}

//import * as monaco from 'monaco-editor';

//monaco.languages.registerDocumentFormattingEditProvider('xml', {
//  async provideDocumentFormattingEdits(model, options, token) {
//    return [
//      {
//        range: model.getFullModelRange(),
//        text: formatXml(model.getValue()),
//      },
//    ];
//  },
//});

//function formatXml(xml: any) {
//  // https://stackoverflow.com/questions/57039218/doesnt-monaco-editor-support-xml-language-by-default
//  const PADDING = ' '.repeat(2);
//  const reg = /(>)(<)(\/*)/g;
//  let pad = 0;

//  xml = xml.replace(reg, '$1\r\n$2$3');

//  return xml.split('\r\n').map((node:any, index:number) => {
//    let indent = 0;
//    if (node.match(/.+<\/\w[^>]*>$/)) {
//      indent = 0;
//    } else if (node.match(/^<\/\w/) && pad > 0) {
//      pad -= 1;
//    } else if (node.match(/^<\w[^>]*[^/]>.*$/)) {
//      indent = 1;
//    } else {
//      indent = 0;
//    }

//    pad += indent;

//    return PADDING.repeat(pad - indent) + node;
//  }).join('\r\n');
//}
