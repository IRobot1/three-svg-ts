import { CubicBezierCurve, EllipseCurve, FileLoader, LineCurve, Loader, Matrix3, Path, QuadraticBezierCurve, SRGBColorSpace, Shape, ShapePath, Vector2, Vector3 } from "three";
import { SVGShapeUtils } from "./shapeutils";

export class SVGLoader2<TData = unknown> extends Loader<TData> {

  //constructor(manager: LoadingManager) {
  //  super(manager);
  //}

  override load(url: string,
    onLoad?: (data: TData) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void
  ): void {
    if (!onLoad) return

    const loader = new FileLoader(this.manager);
    loader.setPath(this.path);
    loader.setRequestHeader(this.requestHeader);
    loader.setWithCredentials(this.withCredentials);
    loader.load(url, (text: string | ArrayBuffer) => {

      try {

        onLoad(this.parse(text));

      } catch (e) {

        if (onError) {

          onError(e);

        } else {

          console.error(e);

        }

        this.manager.itemError(url);

      }

    }, onProgress, onError);

  }

  
  parse(text: string | ArrayBuffer): TData {
    const xpaths: Array<Path> = [];

    const data:any = { paths: xpaths };

    //if (typeof text !== 'string') return <TData>data

    const stylesheets = {};

    const transformStack: Array<Matrix3> = [];

    const tempTransform0 = new Matrix3();
    const tempTransform1 = new Matrix3();
    const tempTransform2 = new Matrix3();
    const tempTransform3 = new Matrix3();
    const tempV2 = new Vector2();
    const tempV3 = new Vector3();

    const currentTransform = new Matrix3();


    function parsePathNode  (node: Element) {

      const d = node.getAttribute('d');

      if (d === '' || d === 'none') return null;
      if (d === null) return null;

      const shape = new ShapePath();
      SVGShapeUtils.parsePath(d, shape)
      return shape

    }

    function parseRectNode  (node: Element) {

      const x = SVGShapeUtils.parseFloatWithUnits(node.getAttribute('x') || 0);
      const y = SVGShapeUtils.parseFloatWithUnits(node.getAttribute('y') || 0);
      const rx = SVGShapeUtils.parseFloatWithUnits(node.getAttribute('rx') || node.getAttribute('ry') || 0);
      const ry = SVGShapeUtils.parseFloatWithUnits(node.getAttribute('ry') || node.getAttribute('rx') || 0);
      const w = SVGShapeUtils.parseFloatWithUnits(node.getAttribute('width'));
      const h = SVGShapeUtils.parseFloatWithUnits(node.getAttribute('height'));

      // Ellipse arc to Bezier approximation Coefficient (Inversed). See:
      // https://spencermortensen.com/articles/bezier-circle/
      const bci = 1 - 0.551915024494;

      const path = new ShapePath();

      // top left
      path.moveTo(x + rx, y);

      // top right
      path.lineTo(x + w - rx, y);
      if (rx !== 0 || ry !== 0) {

        path.bezierCurveTo(
          x + w - rx * bci,
          y,
          x + w,
          y + ry * bci,
          x + w,
          y + ry
        );

      }

      // bottom right
      path.lineTo(x + w, y + h - ry);
      if (rx !== 0 || ry !== 0) {

        path.bezierCurveTo(
          x + w,
          y + h - ry * bci,
          x + w - rx * bci,
          y + h,
          x + w - rx,
          y + h
        );

      }

      // bottom left
      path.lineTo(x + rx, y + h);
      if (rx !== 0 || ry !== 0) {

        path.bezierCurveTo(
          x + rx * bci,
          y + h,
          x,
          y + h - ry * bci,
          x,
          y + h - ry
        );

      }

      // back to top left
      path.lineTo(x, y + ry);
      if (rx !== 0 || ry !== 0) {

        path.bezierCurveTo(x, y + ry * bci, x + rx * bci, y, x + rx, y);

      }

      return path;

    }

    function parsePolygonNode(node:Element) {

      function iterator(match:string, a:any, b:any) {

        const x = SVGShapeUtils.parseFloatWithUnits(a);
        const y = SVGShapeUtils.parseFloatWithUnits(b);

        if (index === 0) {

          path.moveTo(x, y);

        } else {

          path.lineTo(x, y);

        }

        index++;
        return match
      }

      const regex = /([+-]?\d*\.?\d+(?:e[+-]?\d+)?)(?:,|\s)([+-]?\d*\.?\d+(?:e[+-]?\d+)?)/g;

      const path = new ShapePath();

      let index = 0;

      node.getAttribute('points')!.replace(regex, iterator);

      path.autoClose = true;

      return path;

    }

    function parsePolylineNode(node:Element) {

      function iterator(match:string, a:any, b:any) {

        const x = SVGShapeUtils.parseFloatWithUnits(a);
        const y = SVGShapeUtils.parseFloatWithUnits(b);

        if (index === 0) {

          path.moveTo(x, y);

        } else {

          path.lineTo(x, y);

        }

        index++;
        return match
      }

      const regex = /([+-]?\d*\.?\d+(?:e[+-]?\d+)?)(?:,|\s)([+-]?\d*\.?\d+(?:e[+-]?\d+)?)/g;

      const path = new ShapePath();

      let index = 0;

      node.getAttribute('points')!.replace(regex, iterator);

      //path.autoClose = false;

      return path;

    }

    function parseCircleNode(node:Element) {

      const x = SVGShapeUtils.parseFloatWithUnits(node.getAttribute('cx') || 0);
      const y = SVGShapeUtils.parseFloatWithUnits(node.getAttribute('cy') || 0);
      const r = SVGShapeUtils.parseFloatWithUnits(node.getAttribute('r') || 0);

      const subpath = new Path();
      subpath.absarc(x, y, r, 0, Math.PI * 2,true);

      const path = new ShapePath();
      path.subPaths.push(subpath);

      return path;

    }

    function parseEllipseNode(node:Element) {

      const x = SVGShapeUtils.parseFloatWithUnits(node.getAttribute('cx') || 0);
      const y = SVGShapeUtils.parseFloatWithUnits(node.getAttribute('cy') || 0);
      const rx = SVGShapeUtils.parseFloatWithUnits(node.getAttribute('rx') || 0);
      const ry = SVGShapeUtils.parseFloatWithUnits(node.getAttribute('ry') || 0);

      const subpath = new Path();
      subpath.absellipse(x, y, rx, ry, 0, Math.PI * 2,true);

      const path = new ShapePath();
      path.subPaths.push(subpath);

      return path;

    }

    function parseLineNode(node:Element) {

      const x1 = SVGShapeUtils.parseFloatWithUnits(node.getAttribute('x1') || 0);
      const y1 = SVGShapeUtils.parseFloatWithUnits(node.getAttribute('y1') || 0);
      const x2 = SVGShapeUtils.parseFloatWithUnits(node.getAttribute('x2') || 0);
      const y2 = SVGShapeUtils.parseFloatWithUnits(node.getAttribute('y2') || 0);

      const path = new ShapePath();
      path.moveTo(x1, y1);
      path.lineTo(x2, y2);

      //path.autoClose = false;

      return path;

    }
    const parseNode = (node: Element, style: any, data: any) => {
      if (node.nodeType !== 1) return;

      const transform = getNodeTransform(node);

      let isDefsNode = false;

      let path = null;

      switch (node.nodeName) {

        case 'svg':
          style = this.parseStyle(node, style, stylesheets);
          break;

        case 'style':
          this.parseCSSStylesheet(node, stylesheets);
          break;

        case 'g':
          style = this.parseStyle(node, style, stylesheets);
          break;

        case 'path':
          style = this.parseStyle(node, style, stylesheets);
          if (node.hasAttribute('d')) path = parsePathNode(node);
          break;

        case 'rect':
          style = this.parseStyle(node, style, stylesheets);
          path = parseRectNode(node);
          break;

        case 'polygon':
          style = this.parseStyle(node, style, stylesheets);
          path = parsePolygonNode(node);
          break;

        case 'polyline':
          style = this.parseStyle(node, style, stylesheets);
          path = parsePolylineNode(node);
          break;

        case 'circle':
          style = this.parseStyle(node, style, stylesheets);
          path = parseCircleNode(node);
          break;

        case 'ellipse':
          style = this.parseStyle(node, style, stylesheets);
          path = parseEllipseNode(node);
          break;

        case 'line':
          style = this.parseStyle(node, style, stylesheets);
          path = parseLineNode(node);
          break;

        case 'defs':
          isDefsNode = true;
          break;

        case 'use':
          style = this.parseStyle(node, style, stylesheets);

          const href = node.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || '';
          const usedNodeId = href.substring(1);
          const usedNode = (<any>(<SVGElement>node).viewportElement)?.getElementById(usedNodeId);
          if (usedNode) {

            parseNode(usedNode, style,data);

          } else {

            console.warn('SVGLoader: \'use node\' references non-existent node id: ' + usedNodeId);

          }

          break;

        default:
        // console.log( node );

      }

      if (path) {

        if (style.fill !== undefined && style.fill !== 'none') {

          path.color.setStyle(style.fill, SRGBColorSpace);

        }

        transformPath(path, currentTransform);
        
        data.paths.push(path);

        (<any>path).userData = { node: node, style: style };

      }

      const childNodes = node.childNodes;

      for (let i = 0; i < childNodes.length; i++) {

        const node = <SVGElement>childNodes[i];

        if (isDefsNode && node.nodeName !== 'style' && node.nodeName !== 'defs') {

          // Ignore everything in defs except CSS style definitions
          // and nested defs, because it is OK by the standard to have
          // <style/> there.
          continue;

        }

        parseNode(node, style, data);

      }


      if (transform) {

        transformStack.pop();

        if (transformStack.length > 0) {

          currentTransform.copy(transformStack[transformStack.length - 1]);

        } else {

          currentTransform.identity();

        }

      }
    }

    data.xml = new DOMParser().parseFromString(<string>text, 'image/svg+xml'); // application/xml
    parseNode(data.xml.documentElement as any, {
      fill: '#000',
      fillOpacity: 1,
      strokeOpacity: 1,
      strokeWidth: 1,
      strokeLineJoin: 'miter',
      strokeLineCap: 'butt',
      strokeMiterLimit: 4
    }, data);

    // console.log( paths );
    return <TData>data;

    // Calculates the eigensystem of a real symmetric 2x2 matrix
    //    [ A  B ]
    //    [ B  C ]
    // in the form
    //    [ A  B ]  =  [ cs  -sn ] [ rt1   0  ] [  cs  sn ]
    //    [ B  C ]     [ sn   cs ] [  0   rt2 ] [ -sn  cs ]
    // where rt1 >= rt2.
    //
    // Adapted from: https://www.mpi-hd.mpg.de/personalhomes/globes/3x3/index.html
    // -> Algorithms for real symmetric matrices -> Analytical (2x2 symmetric)
    function eigenDecomposition(A: number, B: number, C: number) {

      let rt1, rt2, cs, sn, t;
      const sm = A + C;
      const df = A - C;
      const rt = Math.sqrt(df * df + 4 * B * B);

      if (sm > 0) {

        rt1 = 0.5 * (sm + rt);
        t = 1 / rt1;
        rt2 = A * t * C - B * t * B;

      } else if (sm < 0) {

        rt1 = 0
        rt2 = 0.5 * (sm - rt);

      } else {

        // This case needs to be treated separately to avoid div by 0

        rt1 = 0.5 * rt;
        rt2 = - 0.5 * rt;

      }

      // Calculate eigenvectors

      if (df > 0) {

        cs = df + rt;

      } else {

        cs = df - rt;

      }

      if (Math.abs(cs) > 2 * Math.abs(B)) {

        t = - 2 * B / cs;
        sn = 1 / Math.sqrt(1 + t * t);
        cs = t * sn;

      } else if (Math.abs(B) === 0) {

        cs = 1;
        sn = 0;

      } else {

        t = - 0.5 * cs / B;
        cs = 1 / Math.sqrt(1 + t * t);
        sn = t * cs;

      }

      if (df > 0) {

        t = cs;
        cs = - sn;
        sn = t;

      }

      return { rt1, rt2, cs, sn };

    }

    function getNodeTransform(node: Element) {

      if (!(node.hasAttribute('transform') || (node.nodeName === 'use' && (node.hasAttribute('x') || node.hasAttribute('y'))))) {

        return null;

      }

      const transform = parseNodeTransform(node);

      if (transformStack.length > 0) {

        transform.premultiply(transformStack[transformStack.length - 1]);

      }

      currentTransform.copy(transform);
      transformStack.push(transform);

      return transform;

    }

    function parseNodeTransform(node: Element) {

      const transform = new Matrix3();
      const currentTransform = tempTransform0;

      if (node.nodeName === 'use' && (node.hasAttribute('x') || node.hasAttribute('y'))) {

        const tx = SVGShapeUtils.parseFloatWithUnits(node.getAttribute('x'))
        const ty = SVGShapeUtils.parseFloatWithUnits(node.getAttribute('y'))

        transform.translate(tx, ty);

      }

      if (node.hasAttribute('transform')) {

        const transformsTexts = node.getAttribute('transform')!.split(')');

        for (let tIndex = transformsTexts.length - 1; tIndex >= 0; tIndex--) {

          const transformText = transformsTexts[tIndex].trim();

          if (transformText === '') continue;

          const openParPos = transformText.indexOf('(');
          const closeParPos = transformText.length;

          if (openParPos > 0 && openParPos < closeParPos) {

            const transformType = transformText.slice(0, openParPos);

            const array = SVGShapeUtils.parseFloats(transformText.slice(openParPos + 1))

            currentTransform.identity();

            switch (transformType) {

              case 'translate':

                if (array.length >= 1) {

                  const tx = array[0];
                  let ty = 0;

                  if (array.length >= 2) {

                    ty = array[1];

                  }

                  currentTransform.translate(tx, ty);

                }

                break;

              case 'rotate':

                if (array.length >= 1) {

                  let angle = 0;
                  let cx = 0;
                  let cy = 0;

                  // Angle
                  angle = array[0] * Math.PI / 180;

                  if (array.length >= 3) {

                    // Center x, y
                    cx = array[1];
                    cy = array[2];

                  }

                  // Rotate around center (cx, cy)
                  tempTransform1.makeTranslation(- cx, - cy);
                  tempTransform2.makeRotation(angle);
                  tempTransform3.multiplyMatrices(tempTransform2, tempTransform1);
                  tempTransform1.makeTranslation(cx, cy);
                  currentTransform.multiplyMatrices(tempTransform1, tempTransform3);

                }

                break;

              case 'scale':

                if (array.length >= 1) {

                  const scaleX = array[0];
                  let scaleY = scaleX;

                  if (array.length >= 2) {

                    scaleY = array[1];

                  }

                  currentTransform.scale(scaleX, scaleY);

                }

                break;

              case 'skewX':

                if (array.length === 1) {

                  currentTransform.set(
                    1, Math.tan(array[0] * Math.PI / 180), 0,
                    0, 1, 0,
                    0, 0, 1
                  );

                }

                break;

              case 'skewY':

                if (array.length === 1) {

                  currentTransform.set(
                    1, 0, 0,
                    Math.tan(array[0] * Math.PI / 180), 1, 0,
                    0, 0, 1
                  );

                }

                break;

              case 'matrix':

                if (array.length === 6) {

                  currentTransform.set(
                    array[0], array[2], array[4],
                    array[1], array[3], array[5],
                    0, 0, 1
                  );

                }

                break;

            }

          }

          transform.premultiply(currentTransform);

        }

      }

      return transform;

    }

    function transformPath(path: ShapePath, m: Matrix3) {

      function transfVec2(v2: Vector2) {

        tempV3.set(v2.x, v2.y, 1).applyMatrix3(m);

        v2.set(tempV3.x, tempV3.y);

      }

      function transfEllipseGeneric(curve: EllipseCurve) {

        // For math description see:
        // https://math.stackexchange.com/questions/4544164

        const a = curve.xRadius;
        const b = curve.yRadius;

        const cosTheta = Math.cos(curve.aRotation);
        const sinTheta = Math.sin(curve.aRotation);

        const v1 = new Vector3(a * cosTheta, a * sinTheta, 0);
        const v2 = new Vector3(- b * sinTheta, b * cosTheta, 0);

        const f1 = v1.applyMatrix3(m);
        const f2 = v2.applyMatrix3(m);

        const mF = tempTransform0.set(
          f1.x, f2.x, 0,
          f1.y, f2.y, 0,
          0, 0, 1,
        );

        const mFInv = tempTransform1.copy(mF).invert();
        const mFInvT = tempTransform2.copy(mFInv).transpose();
        const mQ = mFInvT.multiply(mFInv);
        const mQe = mQ.elements;

        const ed = eigenDecomposition(mQe[0], mQe[1], mQe[4]);
        const rt1sqrt = Math.sqrt(ed.rt1);
        const rt2sqrt = Math.sqrt(ed!.rt2);

        curve.xRadius = 1 / rt1sqrt;
        curve.yRadius = 1 / rt2sqrt;
        curve.aRotation = Math.atan2(ed.sn, ed.cs);

        const isFullEllipse =
          (curve.aEndAngle - curve.aStartAngle) % (2 * Math.PI) < Number.EPSILON;

        // Do not touch angles of a full ellipse because after transformation they
        // would converge to a sinle value effectively removing the whole curve

        if (!isFullEllipse) {

          const mDsqrt = tempTransform1.set(
            rt1sqrt, 0, 0,
            0, rt2sqrt, 0,
            0, 0, 1,
          );

          const mRT = tempTransform2.set(
            ed.cs, ed.sn, 0,
            - ed.sn, ed.cs, 0,
            0, 0, 1,
          );

          const mDRF = mDsqrt.multiply(mRT).multiply(mF);

          const transformAngle = (phi: number) => {

            const { x: cosR, y: sinR } =
              new Vector3(Math.cos(phi), Math.sin(phi), 0).applyMatrix3(mDRF);

            return Math.atan2(sinR, cosR);

          };

          curve.aStartAngle = transformAngle(curve.aStartAngle);
          curve.aEndAngle = transformAngle(curve.aEndAngle);

          if (isTransformFlipped(m)) {

            curve.aClockwise = !curve.aClockwise;

          }

        }

      }

      function isTransformFlipped(m: Matrix3) {

        const te = m.elements;
        return te[0] * te[4] - te[1] * te[3] < 0;

      }

      function isTransformSkewed(m: Matrix3) {

        const te = m.elements;
        const basisDot = te[0] * te[3] + te[1] * te[4];

        // Shortcut for trivial rotations and transformations
        if (basisDot === 0) return false;

        const sx = getTransformScaleX(m);
        const sy = getTransformScaleY(m);

        return Math.abs(basisDot / (sx * sy)) > Number.EPSILON;

      }

      function getTransformScaleX(m: Matrix3) {

        const te = m.elements;
        return Math.sqrt(te[0] * te[0] + te[1] * te[1]);

      }

      function getTransformScaleY(m: Matrix3) {

        const te = m.elements;
        return Math.sqrt(te[3] * te[3] + te[4] * te[4]);

      }
      function transfEllipseNoSkew(curve: EllipseCurve) {

        // Faster shortcut if no skew is applied
        // (e.g, a euclidean transform of a group containing the ellipse)

        const sx = getTransformScaleX(m);
        const sy = getTransformScaleY(m);

        curve.xRadius *= sx;
        curve.yRadius *= sy;

        // Extract rotation angle from the matrix of form:
        //
        //  | cosθ sx   -sinθ sy |
        //  | sinθ sx    cosθ sy |
        //
        // Remembering that tanθ = sinθ / cosθ; and that
        // `sx`, `sy`, or both might be zero.
        const theta =
          sx > Number.EPSILON
            ? Math.atan2(m.elements[1], m.elements[0])
            : Math.atan2(- m.elements[3], m.elements[4]);

        curve.aRotation += theta;

        if (isTransformFlipped(m)) {

          curve.aStartAngle *= - 1;
          curve.aEndAngle *= - 1;
          curve.aClockwise = !curve.aClockwise;

        }

      }

      const subPaths = path.subPaths;

      for (let i = 0, n = subPaths.length; i < n; i++) {

        const subPath = subPaths[i];
        const curves = subPath.curves;

        for (let j = 0; j < curves.length; j++) {

          const curve = curves[j];

          const linecurve = <LineCurve>curve;
          const cubiccurve = <CubicBezierCurve>curve;
          const quadcurve = <QuadraticBezierCurve>curve;
          const ellipsecurve = <EllipseCurve>curve;

          if (linecurve.isLineCurve) {

            transfVec2(linecurve.v1);
            transfVec2(linecurve.v2);

          } else if (cubiccurve.isCubicBezierCurve) {

            transfVec2(cubiccurve.v0);
            transfVec2(cubiccurve.v1);
            transfVec2(cubiccurve.v2);
            transfVec2(cubiccurve.v3);

          } else if (quadcurve.isQuadraticBezierCurve) {

            transfVec2(quadcurve.v0);
            transfVec2(quadcurve.v1);
            transfVec2(quadcurve.v2);

          } else if (ellipsecurve.isEllipseCurve) {

            // Transform ellipse center point

            tempV2.set(ellipsecurve.aX, ellipsecurve.aY);
            transfVec2(tempV2);
            ellipsecurve.aX = tempV2.x;
            ellipsecurve.aY = tempV2.y;

            // Transform ellipse shape parameters

            if (isTransformSkewed(m)) {

              transfEllipseGeneric(ellipsecurve);

            } else {

              transfEllipseNoSkew(ellipsecurve);

            }

          }

        }

      }

    }
  }

  parseStyle(node: Element, style: any, stylesheets: any) {

    style = Object.assign({}, style); // clone style

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

    function addStyle(svgName: string, jsName: string, adjustFunction?: (v: any) => any) {

      if (adjustFunction === undefined) adjustFunction = function copy(v: string) {

        if (v.startsWith('url')) console.warn('SVGLoader: url access in attributes is not implemented.');

        return v;

      };

      if (node.hasAttribute(svgName)) style[jsName] = adjustFunction(node.getAttribute(svgName)!);
      if (stylesheetStyles[svgName]) style[jsName] = adjustFunction(stylesheetStyles[svgName]);

      const nodestyle = (node as any).style
      if (nodestyle && nodestyle[svgName] !== '') style[jsName] = adjustFunction(nodestyle[svgName]);

    }

    function clamp(v: number) {

      return Math.max(0, Math.min(1, SVGShapeUtils.parseFloatWithUnits(v)));

    }

    function positive(v: number) {

      return Math.max(0, SVGShapeUtils.parseFloatWithUnits(v));

    }

    addStyle('fill', 'fill');
    addStyle('fill-opacity', 'fillOpacity', clamp);
    addStyle('fill-rule', 'fillRule');
    addStyle('opacity', 'opacity', clamp);
    addStyle('stroke', 'stroke');
    addStyle('stroke-opacity', 'strokeOpacity', clamp);
    addStyle('stroke-width', 'strokeWidth', positive);
    addStyle('stroke-linejoin', 'strokeLineJoin');
    addStyle('stroke-linecap', 'strokeLineCap');
    addStyle('stroke-miterlimit', 'strokeMiterLimit', positive);
    addStyle('visibility', 'visibility');

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

}
