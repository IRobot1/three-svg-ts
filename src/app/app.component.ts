import { Component } from '@angular/core';
import { ThreeJSApp } from './threejs-app';
import { GettingStartedExample } from './getting-started-example';
import { BasicShapesExample } from './basic-shapes';
import { PathsExample } from './paths-example';
import { StrokesExample } from './strokes-example';
import { GradientsExample } from './gradient-example';
import { TextExample } from './text-example';
import { GroupExample } from './group-example';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'three-svg-ts'

  constructor() {
    const app = new ThreeJSApp()

    app.router.add('/', () => { return new GettingStartedExample(app) })
    app.router.add('basic', () => { return new BasicShapesExample(app) })
    app.router.add('paths', () => { return new PathsExample(app) })
    app.router.add('strokes', () => { return new StrokesExample(app) })
    app.router.add('gradients', () => { return new GradientsExample(app) })
    app.router.add('text', () => { return new TextExample(app) })
    app.router.add('group', () => { return new GroupExample(app) })

    app.navigateto('group')
  }
}
