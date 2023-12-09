import { GroupShapeType, SVGSchema, ShapeTypes } from "./schema";
import { SVGShapeUtils } from "./shapeutils";
import { SVGShapeOptions } from "./svgshape";
import { CircleParams, EllipseParams, GradientStop, LineParams, LinearGradient, PathParams, PolygonParams, PolylineParams, PresentationAttributes, RadialGradient, RectParams, TextAlignmentType, TextParams } from "./types";

export class SVGParser {

  log(message: any, ...optionalParams: any[]) { }

  parse(text: string | ArrayBuffer): SVGSchema {
    const options: SVGShapeOptions = {
      fillOpacity: 1,
      strokeOpacity: 1,
      strokeLineJoin: 'miter',
      strokeLineCap: 'butt',
      strokeMiterLimit: 4
    }
    const elements: Array<ShapeTypes> = []
    const schema: SVGSchema = { options, elements }

    const stylesheets = {};

    const dom = (<string>text).replace(`<?xml version="1.0" standalone="no"?>`, '')
    const xml = new DOMParser().parseFromString(dom, 'image/svg+xml'); // application/xml

    const stylenode = xml.documentElement.querySelector('style')
    if (stylenode) this.parseCSSStylesheet(stylenode, stylesheets);

    const svgnode = xml.documentElement
    const style = this.parseStyle(svgnode, schema.options, stylesheets);
    this.parseSVGNode(svgnode, schema);

    this.parseNode(schema, schema.elements, xml.documentElement as any, style, stylesheets);

    return schema
  }

  parseNode(schema: SVGSchema, elements: Array<ShapeTypes>, node: Element, style: PresentationAttributes, stylesheets: any) {
    if (node.nodeType !== 1) return;

    switch (node.nodeName) {

      case 'svg':
        // already handled
        break;

      case 'style':
        // already handled
        break;

      case 'g': {
        const group = this.parseGroupNode(node, elements);
        this.parseStyle(node, group.options, stylesheets);
        elements = group.elements
      }
        break;

      case 'path':
        style = this.parsePathNode(node, elements);
        this.parseStyle(node, style, stylesheets);
        break;

      case 'rect':
        style = this.parseRectNode(node, elements);
        this.parseStyle(node, style, stylesheets);
        break;

      case 'polygon':
        style = this.parsePolygonNode(node, elements);
        this.parseStyle(node, style, stylesheets);
        break;

      case 'polyline':
        style = this.parsePolylineNode(node, elements);
        this.parseStyle(node, style, stylesheets);
        break;

      case 'circle':
        style = this.parseCircleNode(node, elements);
        this.parseStyle(node, style, stylesheets);
        break;

      case 'ellipse':
        style = this.parseEllipseNode(node, elements);
        this.parseStyle(node, style, stylesheets);
        break;

      case 'line':
        style = this.parseLineNode(node, elements);
        this.parseStyle(node, style, stylesheets);
        break;

      case 'text':
        style = this.parseTextNode(node, elements);
        this.parseStyle(node, style, stylesheets);
        break;

      case 'textPath': {
        const tstyle = style as TextParams
        if (node.textContent)
          tstyle.content = node.textContent.trim() || undefined
        tstyle.textPath = node.getAttribute('href') || undefined
      }
        break;

      case 'defs':
        // child nodes handled below
        break;

      case 'use': {
        style = this.parseStyle(node, style, stylesheets);

        const href = node.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || '';
        const usedNodeId = href.substring(1);
        const usedNode = (<any>node).viewportElement.getElementById(usedNodeId);
        if (usedNode) {

          this.parseNode(schema, elements, usedNode, style, stylesheets);

        } else {

          this.log('SVGParser: use references non-existent node id: ' + usedNodeId);

        }
      }
        break;

      case 'linearGradient':
        stylesheets.gradient = this.parseLinearGradientNode(node);
        if (!schema.gradients) schema.gradients = []
        schema.gradients.push(stylesheets.gradient)
        break;

      case 'radialGradient':
        stylesheets.gradient = this.parseRadialGradientNode(node);
        if (!schema.gradients) schema.gradients = []
        schema.gradients.push(stylesheets.gradient)
        break;

      case 'stop': {
        const stop = this.parseGradientStopNode(node, stylesheets.gradient);
        this.parseStyle(node, stop, stylesheets);
      }
        break;

      case 'clipPath':
      case 'mask':
      case 'filter':
      case 'feGaussianBlur':
      case 'animate':
      case 'set':
      case 'animateColor':
      case 'animateTransform':
      case 'title':
      case 'image':
        this.log(node.nodeName + ' not implemented')
        break;
      default:
        this.log(node.nodeName)
        break;
    }

    const childNodes = node.childNodes;

    for (let i = 0; i < childNodes.length; i++) {

      const node = <SVGElement>childNodes[i];

      this.parseNode(schema, elements, node, style, stylesheets);

    }
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

    function addStyle(svgName: string, jsName: string) {
      const astyle = style as any
      if (node.hasAttribute(svgName)) astyle[jsName] = node.getAttribute(svgName)!;
      if (stylesheetStyles[svgName]) astyle[jsName] = stylesheetStyles[svgName];
      if (stylesheetStyles[jsName]) astyle[jsName] = stylesheetStyles[jsName].replace(/"/g, '');

      const nodestyle = (node as any).style
      if (nodestyle && nodestyle[svgName] !== '') astyle[jsName] = nodestyle[svgName].replace(/"/g, '');

    }

    addStyle('transform', 'transform');
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
    addStyle('stop-color', 'stopColor');
    addStyle('stop-opacity', 'stopOpacity');

    if (node.hasAttribute('style')) {
      const styleObject = this.parseStyleAttribute(node.getAttribute('style'));
      style['fill'] = styleObject['fill'] || addStyle('fill', 'fill');
      style['stroke'] = styleObject['stroke'] || addStyle('stroke', 'stroke');
      style['fillOpacity'] = styleObject['fill-opacity'] || addStyle('fill-opacity', 'fillOpacity');
      style['opacity'] = styleObject['opacity'] || addStyle('opacity', 'opacity');
    }

    return style;
  }

  parseStyleAttribute(styleAttribute: string | undefined | null) {
    const styleObject: any = {};
    if (styleAttribute) {
      styleAttribute.split(';').forEach(function (style) {
        const parts = style.split(':');
        if (parts.length === 2) {
          styleObject[parts[0].trim()] = parts[1].trim();
        }
      });
    }
    return styleObject;
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

  parseSVGNode(node: Element, schema: SVGSchema) {
    if (!schema.options) return

    schema.options.width = SVGShapeUtils.parseFloatWithUnits(node.getAttribute('width'));
    schema.options.height = SVGShapeUtils.parseFloatWithUnits(node.getAttribute('height'));

    const viewbox = node.getAttribute('viewBox')
    if (viewbox)
      // convert to array of numbers
      schema.options.viewBox = viewbox.split(' ').map(x => +x)

  }

  parseGroupNode(node: Element, parent: Array<ShapeTypes>): GroupShapeType {
    const options: PresentationAttributes = {}
    const elements: Array<ShapeTypes> = []
    const group: GroupShapeType = { options, elements: elements }
    parent.push({ group })
    return group
  }

  parsePathNode(node: Element, elements: Array<ShapeTypes>): PresentationAttributes {
    const path: PathParams = {}
    path.d = node.getAttribute('d') || undefined
    path.id = node.getAttribute('id') || undefined

    elements.push({ path })
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

    elements.push({ circle })
    return circle
  }

  parseEllipseNode(node: Element, elements: Array<ShapeTypes>): PresentationAttributes {
    const ellipse: EllipseParams = {}

    ellipse.cx = node.getAttribute('cx') || 0
    ellipse.cy = node.getAttribute('cy') || 0
    ellipse.rx = node.getAttribute('rx') || 0
    ellipse.ry = node.getAttribute('ry') || 0

    elements.push({ ellipse })
    return ellipse
  }

  parseLineNode(node: Element, elements: Array<ShapeTypes>): PresentationAttributes {
    const line: LineParams = {}

    line.x1 = node.getAttribute('x1') || 0
    line.y1 = node.getAttribute('y1') || 0
    line.x2 = node.getAttribute('x2') || 0
    line.y2 = node.getAttribute('y2') || 0

    elements.push({ line })
    return line
  }

  parseTextNode(node: Element, elements: Array<ShapeTypes>): PresentationAttributes {
    const text: TextParams = {}

    text.content = node.textContent || undefined
    text.x = node.getAttribute('x') || 0
    text.y = node.getAttribute('y') || 0
    text.dx = node.getAttribute('dx') || 0
    text.dy = node.getAttribute('dy') || 0
    text.textAlignment = <TextAlignmentType>node.getAttribute('alignment-baseline') || 'middle'

    elements.push({ text })
    return text
  }

  parseLinearGradientNode(node: Element): LinearGradient {
    const id = node.getAttribute('id') || ''
    const stops: Array<GradientStop> = []
    const gradient: LinearGradient = { type: 'linear', id, stops }

    gradient.x1 = node.getAttribute('x1') || 0
    gradient.y1 = node.getAttribute('y1') || 0
    gradient.x2 = node.getAttribute('x2') || 1
    gradient.y2 = node.getAttribute('y2') || 0
    gradient.gradientUnits = node.getAttribute('gradientUnits') || undefined
    gradient.gradientTransform = node.getAttribute('gradientTransform') || undefined

    return gradient
  }

  parseRadialGradientNode(node: Element): RadialGradient {
    const id = node.getAttribute('id') || ''
    const stops: Array<GradientStop> = []
    const gradient: RadialGradient = { type: 'radial', id, stops }

    gradient.cx = node.getAttribute('cx') || undefined
    gradient.cy = node.getAttribute('cy') || undefined
    gradient.r = node.getAttribute('r') || undefined
    gradient.fx = node.getAttribute('fx') || undefined
    gradient.fy = node.getAttribute('fy') || undefined
    gradient.gradientUnits = node.getAttribute('gradientUnits') || undefined
    gradient.gradientTransform = node.getAttribute('gradientTransform') || undefined

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
