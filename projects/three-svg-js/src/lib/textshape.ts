import { Font } from "three/examples/jsm/loaders/FontLoader";
import { BaseShape } from "./baseshape";
import { SVGShapeUtils } from "./shapeutils";
import { SVGOptions } from "./svgshape";
import { PresentationAttributes, TextAnchorType, TextParams } from "./types";
import { BufferGeometry, Color, Material, MathUtils, Mesh, MeshBasicMaterial, SRGBColorSpace, Vector3 } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { GroupShape } from "./groupshape";

export interface Text {
  x: number,
  y: number,
}

export class TextShape extends BaseShape implements Text {
  constructor(svg: SVGOptions, parent: GroupShape, params: TextParams) {
    super('text', svg, params)
    this.batch = true
    this.x = SVGShapeUtils.parseFloatWithUnits(params.x || 0);
    this.y = SVGShapeUtils.parseFloatWithUnits(params.y || 0);
    this.dx = SVGShapeUtils.parseFloatWithUnits(params.dx || 0);
    this.dy = SVGShapeUtils.parseFloatWithUnits(params.dy || 0);
    this.fontSize = SVGShapeUtils.parseFloatWithUnits(params.fontSize || 18);
    this.textSpacing = SVGShapeUtils.parseFloatWithUnits(params.textSpacing || this.fontSize / 4);
    this.textPath = params.textPath
    this.text = params.content
    this.font = params.font
    this.textAnchor = params.textAnchor
    this.batch = false

    const material = this.svg.createFillMaterial() as MeshBasicMaterial
    this.applyFill(material.color, params);

    this.name = 'text-fill'
    this.material = material
    this.position.set(this.x * this.scale.x, this.y * this.scale.y, 0)
    parent.addMesh(this)
  }

  private applyFill(color: Color, params: PresentationAttributes) {
    if (params.fill === 'none') return
    if (!params.fill || params.fill === 'transparent') {
      if (params.stroke)
        color.setStyle(params.stroke, SRGBColorSpace);
    }
    else if (params.fill)
      color.setStyle(params.fill, SRGBColorSpace);

    //transformPath( path, currentTransform );
  }

  private _text: string | undefined
  get text(): string | undefined { return this._text }
  set text(newvalue: string | undefined) {
    if (newvalue != this._text) {
      this._text = newvalue
      if (!this.batch) this.update()
    }
  }

  private _x = 0
  get x(): number { return this._x }
  set x(newvalue: number) {
    if (newvalue != this._x) {
      this._x = newvalue
      if (!this.batch) this.update()
    }
  }
  private _y = 0
  get y(): number { return this._y }
  set y(newvalue: number) {
    if (newvalue != this._y) {
      this._y = newvalue
      if (!this.batch) this.update()
    }
  }

  private _dx = 0
  get dx(): number { return this._dx }
  set dx(newvalue: number) {
    if (newvalue != this._dx) {
      this._dx = newvalue
      if (!this.batch) this.update()
    }
  }

  private _dy = 0
  get dy(): number { return this._dy }
  set dy(newvalue: number) {
    if (newvalue != this._dy) {
      this._dy = newvalue
      if (!this.batch) this.update()
    }
  }

  private _font: Font | undefined
  get font(): Font | undefined { return this._font }
  set font(newvalue: Font | undefined) {
    if (newvalue != this._font) {
      this._font = newvalue
      if (!this.batch) this.update()
    }
  }

  private _fontSize = 10
  get fontSize(): number { return this._fontSize }
  set fontSize(newvalue: number) {
    if (newvalue != this._fontSize) {
      this._fontSize = newvalue
      if (!this.batch) this.update()
    }
  }

  private _textSpacing = 0
  get textSpacing(): number { return this._textSpacing }
  set textSpacing(newvalue: number) {
    if (newvalue != this._textSpacing) {
      this._textSpacing = newvalue
      if (!this.batch) this.update()
    }
  }

  private _textPath: string | undefined
  get textPath(): string | undefined { return this._textPath }
  set textPath(newvalue: string | undefined) {
    if (newvalue != this._textPath) {
      this._textPath = newvalue
      if (!this.batch) this.update()
    }
  }

  private _textAnchor: TextAnchorType | undefined
  get textAnchor(): TextAnchorType | undefined { return this._textAnchor }
  set textAnchor(newvalue: TextAnchorType | undefined) {
    if (newvalue != this._textAnchor) {
      this._textAnchor = newvalue
      if (!this.batch) this.update()
    }
  }


  update() {
    if (!this.text || !this.font) return

    if (this.textPath) {
      this.children.length = 0;
      this.updatePath(this.textPath, this.font, this.fontSize, this.textSpacing, this.text)
    }
    else {
      const geometry = new TextGeometry(this.text, { font: this.font, height: 0, size: this.fontSize * 0.8 })
      geometry.center() // center and compute bounding box
      const size = new Vector3()
      geometry.boundingBox!.getSize(size)

      switch (this.textAnchor) {
        case 'start':
          geometry.translate(size.x / 2, 0, 0)
          break;
        case 'middle':
          // already centered
          break;
        case 'end':
          geometry.translate(-size.x / 2, 0, 0)
          break;
      }

      this.geometry = geometry
      this.position.y = this.y - size.y / 2
      this.scale.y = -1
    }


  }

  private updatePath(id: string, font: Font, size: number, spacing: number, text: string) {
    if (id.startsWith('#')) id = id.substring(1)

    const shape = this.svg.getPathById(id)
    if (!shape) return

    const curve = shape.toShapes(false)[0]
    if (!curve) return

    // Calculate the total length of the text
    let totalTextLength = 0;
    let textData: Array<{ geometry?: BufferGeometry, charWidth: number; }> = [];

    Array.from(text).forEach(char => {
      let charWidth = size / 3
      let geometry: BufferGeometry | undefined;
      if (char !== ' ') {
        geometry = new TextGeometry(char, { font: font, size: size, height: 0 });
        geometry.computeBoundingBox();
        const bbox = geometry.boundingBox!;
        charWidth = bbox.max.x - bbox.min.x;
      }
      textData.push({ geometry, charWidth });
      totalTextLength += charWidth;
      //console.warn(char, charWidth)
    });

    const textCurveLength = totalTextLength / curve.getLength()
    // TODO: align

    let startDistance = 0;  // Initialize the starting distance along the curve

    const material = this.material
    textData.forEach((char, i) => {
      let textWidth = char.charWidth
      textWidth = Math.min(size * 1.1, Math.max(size / 5, textWidth))

      // get the point at current position along curve
      const point = curve.getPointAt(startDistance / totalTextLength * textCurveLength);

      if (point && char.geometry) {
        const charMesh = new Mesh(char.geometry, material);

        // Position the text mesh
        charMesh.position.set(point.x, point.y, 0);

        // Get the tangent and adjust the rotation
        const tangent = curve.getTangentAt(startDistance / totalTextLength * textCurveLength);
        const angle = Math.atan2(tangent.y, tangent.x)
        charMesh.rotation.z = angle
        charMesh.scale.y = -1

        // Add the character mesh to the scene
        this.add(charMesh);

      }

      // Update startDistance for the next character
      startDistance += textWidth + spacing
    });
  }

}
