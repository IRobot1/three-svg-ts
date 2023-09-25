import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ThreeJSApp } from './threejs-app';
import { AmbientLight, Color, PointLight, Scene, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { SVGShape } from 'three-svg-js';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { BaseShape } from 'three-svg-js';
import { TextShape } from 'three-svg-js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import { showSVG } from './showsvg';
import { Exporter } from './exporter';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  svgcode: string = `<!-- https://github.com/HatScripts/circle-flags/blob/gh-pages/flags/ca.svg -->
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
	<mask id="a">
		<circle cx="256" cy="256" r="256" fill="#fff"/>
	</mask>
	<g mask="url(#a)">
		<path fill="#d80027" d="M0 0v512h144l112-64 112 64h144V0H368L256 64 144 0Z"/>
		<path fill="#eee" d="M144 0h224v512H144Z"/>
		<path fill="#d80027" d="m301 289 44-22-22-11v-22l-45 22 23-44h-23l-22-34-22 33h-23l23 45-45-22v22l-22 11 45 22-12 23h45v33h22v-33h45z"/>
	</g>
</svg>`

  @ViewChild('test') test!: ElementRef<HTMLDivElement>;

  app!: ThreeJSApp
  scene!: Scene

  constructor(private httpClient: HttpClient) { }
 
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



    const loader = new FontLoader();
    loader.load('assets/helvetiker_regular.typeface.json', (font: Font) => {
      this.font = font
    })

    this.updateCanvas(this.svgcode)

  }

  font!: Font

  updateCanvas(svg: string) {
    const svgshape = new SVGShape()
    const schema = svgshape.loadSVG(svg)
    console.warn(schema)
    const timer = setTimeout(() => {
      this.jsoncode = JSON.stringify(schema, undefined, 1)
      clearTimeout(timer)
    }, 100)


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
      filename = this.filename.replace('.svg', '.json')
    const ex = new Exporter();
    ex.saveString(this.jsoncode!, filename)
  }

  saveGLTF() {
    if (!this.svgshape) return

    let filename = this.filename
    if (!this.filename)
      filename = new Date().getTime().toString()
    else
      filename = this.filename.replace('.svg', '')
    const ex = new Exporter();
    ex.exportGLTF(this.svgshape, filename, false)
  }

  loadExample(example: string) {
    this.filename = example
    const headers = new HttpHeaders();
    headers.set('Accept', 'image/svg+xml');
    this.httpClient.get('./assets/' + example, { headers, responseType: 'text' }).subscribe(content => {
      this.svgcode = content as string
    })

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
