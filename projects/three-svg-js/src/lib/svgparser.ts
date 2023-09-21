import { ShapeSchema, ShapeTypes } from "./schema";
import { SVGShapeUtils } from "./shapeutils";
import { SVGShapeOptions } from "./svgshape";
import { CircleParams, EllipseParams, GradientStop, LineParams, LinearGradient, PathParams, PolygonParams, PolylineParams, PresentationAttributes, RectParams, TextParams } from "./types";

export class SVGParser {

  parse(text: string | ArrayBuffer): ShapeSchema {
    const options: SVGShapeOptions = {}
    const elements: Array<ShapeTypes> = []
    const schema: ShapeSchema = { options, elements }

    const stylesheets = {};

    const xml = new DOMParser().parseFromString(<string>text, 'image/svg+xml'); // application/xml

    const node = xml.documentElement.querySelector('style')
    if (node) this.parseCSSStylesheet(node, stylesheets);

    this.parseNode(schema, xml.documentElement as any, {
      fill: '#000',
      fillOpacity: 1,
      strokeOpacity: 1,
      strokeWidth: 1,
      strokeLineJoin: 'miter',
      strokeLineCap: 'butt',
      strokeMiterLimit: 4
    }, stylesheets);
    
    return schema
  }

  parseNode(schema: ShapeSchema, node: Element, style: PresentationAttributes, stylesheets: any) {
    if (node.nodeType !== 1) return;

    const transform = this.getNodeTransform(node);
    
    switch (node.nodeName) {

      case 'svg':
        style = this.parseStyle(node, style, stylesheets);
        this.parseSVGNode(node, schema);
        break;

      case 'style':
        // already handled
        break;

      case 'g':
        style = this.parseStyle(node, style, stylesheets);
        console.warn('group style', style)
        break;

      case 'path':
        style = this.parsePathNode(node, schema.elements);
        this.parseStyle(node, style, stylesheets);
        break;

      case 'rect':
        style = this.parseRectNode(node, schema.elements);
        this.parseStyle(node, style, stylesheets);
        break;

      case 'polygon':
        style = this.parsePolygonNode(node, schema.elements);
        this.parseStyle(node, style, stylesheets);
        break;

      case 'polyline':
        style = this.parsePolylineNode(node, schema.elements);
        this.parseStyle(node, style, stylesheets);
        break;

      case 'circle':
        style = this.parseCircleNode(node, schema.elements);
        this.parseStyle(node, style, stylesheets);
        break;

      case 'ellipse':
        style = this.parseEllipseNode(node, schema.elements);
        this.parseStyle(node, style, stylesheets);
        break;

      case 'line':
        style = this.parseLineNode(node, schema.elements);
        this.parseStyle(node, style, stylesheets);
        break;

      case 'text':
        style = this.parseTextNode(node, schema.elements);
        this.parseStyle(node, style, stylesheets);
        break;

      case 'textPath':
        const tstyle = style as TextParams
        tstyle.content = node.textContent?.trim() || undefined
        tstyle.textPath = node.getAttribute('href') || undefined
        break;

      case 'defs':
        // child nodes handled below
        break;

      case 'use':
        console.warn(node.nodeName)
        style = this.parseStyle(node, style, stylesheets);

        const href = node.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || '';
        const usedNodeId = href.substring(1);
        const usedNode = (<any>(<SVGElement>node).viewportElement)?.getElementById(usedNodeId);
        if (usedNode) {

          this.parseNode(schema, usedNode, style, stylesheets);

        } else {

          console.warn('SVGLoader: \'use node\' references non-existent node id: ' + usedNodeId);

        }

        break;

      case 'linearGradient':
        stylesheets.gradient = this.parseLinearGradientNode(node, schema.elements);
        if (!schema.gradients) schema.gradients = []
        schema.gradients.push(stylesheets.gradient)
        break;
      case 'stop':
        const stop = this.parseGradientStopNode(node, stylesheets.gradient);
        this.parseStyle(node, stop, stylesheets);
        break;

      default:
        console.warn(node.nodeName)
      // console.log( node );

    }

    //if (path) {

    //  if (style.fill !== undefined && style.fill !== 'none') {

    //    path.color.setStyle(style.fill, SRGBColorSpace);

    //  }

    //  transformPath(path, currentTransform);

    //  data.paths.push(path);

    //  (<any>path).userData = { node: node, style: style };

    //}

    const childNodes = node.childNodes;

    for (let i = 0; i < childNodes.length; i++) {

      const node = <SVGElement>childNodes[i];

      this.parseNode(schema, node, style, stylesheets);

    }


    //  if (transform) {

    //    transformStack.pop();

    //    if (transformStack.length > 0) {

    //      currentTransform.copy(transformStack[transformStack.length - 1]);

    //    } else {

    //      currentTransform.identity();

    //    }

    //  }
  }


  getNodeTransform(node: Element): any {

    if (!(node.hasAttribute('transform') || (node.nodeName === 'use' && (node.hasAttribute('x') || node.hasAttribute('y'))))) {

      return null;

    }
    return node.hasAttribute('transform')
  }

  parseStyle(node: Element, style: any, stylesheets: any) {

    //style = Object.assign({}, style); // clone style

    let stylesheetStyles: any = {};

    if (node.hasAttribute('class')) {
      const classSelectors = node.getAttribute('class')!
        .split(/\s/)
        .filter(Boolean)
        .map(i => i.trim());

      for (let i = 0; i < classSelectors.length; i++) {

        stylesheetStyles = Object.assign(stylesheetStyles, stylesheets['.' + classSelectors[i]]);

      }

    }

    if (node.hasAttribute('id')) {

      stylesheetStyles = Object.assign(stylesheetStyles, stylesheets['#' + node.getAttribute('id')]);
      
    }

    function addStyle(svgName: string, jsName: string, debug = false) {
      const astyle = style as any
      if (node.hasAttribute(svgName)) astyle[jsName] = node.getAttribute(svgName)!;
      if (stylesheetStyles[svgName]) astyle[jsName] = stylesheetStyles[svgName];
      if (stylesheetStyles[jsName]) astyle[jsName] = stylesheetStyles[jsName].replace(/"/g,'');
      
      const nodestyle = (node as any).style
      if (nodestyle && nodestyle[svgName] !== '') astyle[jsName] = nodestyle[svgName];

    }

    addStyle('fill', 'fill');
    addStyle('fill-opacity', 'fillOpacity');
    addStyle('fill-rule', 'fillRule');
    addStyle('opacity', 'opacity');
    addStyle('stroke', 'stroke');
    addStyle('stroke-opacity', 'strokeOpacity');
    addStyle('stroke-width', 'strokeWidth');
    addStyle('stroke-linejoin', 'strokeLineJoin');
    addStyle('stroke-linecap', 'strokeLineCap');
    addStyle('stroke-miterlimit', 'strokeMiterLimit');
    addStyle('visibility', 'visibility');

    addStyle('text-anchor', 'textAnchor');
    addStyle('font-size', 'fontSize');

    addStyle('offset', 'offset');
    addStyle('stop-color', 'stopColor', true);
    addStyle('stop-opacity', 'stopOpacity');

    return style;
  }

  parseCSSStylesheet(node: any, stylesheets: any) {

    if (!node.sheet || !node.sheet.cssRules || !node.sheet.cssRules.length) return;

    for (let i = 0; i < node.sheet.cssRules.length; i++) {

      const stylesheet = node.sheet.cssRules[i];

      if (stylesheet.type !== 1) continue;

      const selectorList = stylesheet.selectorText
        .split(/,/gm)
        .filter(Boolean)
        .map((i: string) => i.trim());

      for (let j = 0; j < selectorList.length; j++) {

        // Remove empty rules
        const definitions = Object.fromEntries(
          Object.entries(stylesheet.style).filter(([, v]) => v !== '')
        );

        stylesheets[selectorList[j]] = Object.assign(
          stylesheets[selectorList[j]] || {},
          definitions
        );

      }

    }

  }

  parseSVGNode(node: Element, schema: ShapeSchema) {
    if (!schema.options) return

    schema.options.width = SVGShapeUtils.parseFloatWithUnits(node.getAttribute('width') || 0);
    schema.options.height = SVGShapeUtils.parseFloatWithUnits(node.getAttribute('height') || 0);

    const viewbox = node.getAttribute('viewBox')
    if (viewbox)
      // remove [] and convert to array of numbers
      schema.options.viewBox = viewbox.substring(1, viewbox.length - 1).split(',').map(x => +x)
    else
      schema.options.viewBox = [0, 0, schema.options.width, schema.options.height]
  }

  parsePathNode(node: Element, elements: Array<ShapeTypes>): PresentationAttributes {
    const path: PathParams = {}
    path.d = node.getAttribute('d') || undefined
    path.id = node.getAttribute('id') || undefined

    elements.push({path})
    return path
  }

  parseRectNode(node: Element, elements: Array<ShapeTypes>): PresentationAttributes {
    const rect: RectParams = {}

    rect.x = node.getAttribute('x') || 0
    rect.y = node.getAttribute('y') || 0
    rect.rx = node.getAttribute('rx') || node.getAttribute('ry') || 0
    rect.ry = node.getAttribute('ry') || node.getAttribute('rx') || 0
    rect.width = node.getAttribute('width') || 400
    rect.height = node.getAttribute('height') || 300

    elements.push({ rect })
    return rect;
  }

  parsePolygonNode(node: Element, elements: Array<ShapeTypes>): PresentationAttributes {
    const polygon: PolygonParams = {}
    polygon.points = node.getAttribute('points') || undefined

    elements.push({ polygon })
    return polygon
  }

  parsePolylineNode(node: Element, elements: Array<ShapeTypes>): PresentationAttributes {
    const polyline: PolylineParams = {}
    polyline.points = node.getAttribute('points') || undefined

    elements.push({ polyline })
    return polyline
  }

  parseCircleNode(node: Element, elements: Array<ShapeTypes>): PresentationAttributes {
    const circle: CircleParams = {}

    circle.cx = node.getAttribute('cx') || 0
    circle.cy = node.getAttribute('cy') || 0
    circle.r = node.getAttribute('r') || 0

    elements.push({circle})
    return circle
  }

  parseEllipseNode(node: Element, elements: Array<ShapeTypes>): PresentationAttributes {
    const ellipse: EllipseParams = {}

    ellipse.cx = node.getAttribute('cx') || 0
    ellipse.cy = node.getAttribute('cy') || 0
    ellipse.rx = node.getAttribute('rx') || 0
    ellipse.ry = node.getAttribute('ry') || 0

    elements.push({ellipse})
    return ellipse
  }

  parseLineNode(node: Element, elements: Array<ShapeTypes>): PresentationAttributes {
    const line: LineParams = {}

    line.x1 = node.getAttribute('x1') || 0
    line.y1 = node.getAttribute('y1') || 0
    line.x2 = node.getAttribute('x2') || 0
    line.y2 = node.getAttribute('y2') || 0

    elements.push({line})
    return line
  }

  parseTextNode(node: Element, elements: Array<ShapeTypes>): PresentationAttributes {
    const text: TextParams = {}

    text.content = node.textContent || undefined
    text.x = node.getAttribute('x') || 0
    text.y = node.getAttribute('y') || 0
    text.dx = node.getAttribute('dx') || 0
    text.dy = node.getAttribute('dy') || 0

    elements.push({ text })
    return text
  }

  parseLinearGradientNode(node: Element, elements: Array<ShapeTypes>): LinearGradient {
    const id = node.getAttribute('id') || ''
    const stops : Array<GradientStop> = []
    const gradient: LinearGradient = {id, stops}

    gradient.x1 = node.getAttribute('x1') || 0
    gradient.y1 = node.getAttribute('y1') || 0
    gradient.x2 = node.getAttribute('x2') || 1
    gradient.y2 = node.getAttribute('y2') || 0

    return gradient
  }

  parseGradientStopNode(node: Element, gradient: LinearGradient): GradientStop {
    const stop: GradientStop = {}

    stop.offset = node.getAttribute('offset') || 0
    stop.stopColor = node.getAttribute('stop-color') || undefined

    gradient.stops.push(stop)
    return stop
  }
}
