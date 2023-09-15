import { Component } from '@angular/core';
import { ThreeJSApp } from './threejs-app';
import { GettingStartedExample } from './getting-started-example';
import { BasicShapesExample } from './basic-shapes';


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

    app.navigateto('basic')
  }
}
