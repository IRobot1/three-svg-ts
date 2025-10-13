import { Mesh, MeshBasicMaterial, Shape, Texture, RepeatWrapping } from 'three'
import { BaseShape } from './baseshape'
import { SVGOptions } from './svgshape'
import { GroupShape } from './groupshape'
import { SVGShapeUtils } from './shapeutils'

export interface ImageParams {
    href?: string;
    x?: number | string;
    y?: number | string;
    width?: number | string;
    height?: number | string;
    elementId?: string;
    //preserveAspectRatio?: string;
    //transform?: string;
}

export class ImageShape extends BaseShape implements ImageParams {

    constructor(svg: SVGOptions, parent: GroupShape, params: ImageParams) {
        super('image', svg, params as any)
        this.batch = true

        // initialize props
        this.href = params.href
        //this.elementId = params.elementid
        //this.preserveAspectRatio = params.preserveAspectRatio
        //this.transform = params.transform

        this._x = SVGShapeUtils.parseFloatWithUnits(params.x, svg.width) || 0
        this._y = SVGShapeUtils.parseFloatWithUnits(params.y, svg.height) || 0
        this._w = SVGShapeUtils.parseFloatWithUnits(params.width, svg.width) || 100
        this._h = SVGShapeUtils.parseFloatWithUnits(params.height, svg.height) || 100

        this.batch = false

        // // stroke (the ImageShape itself) - can be used to draw stroke outlines
        // const strokematerial = this.getStrokeMaterial()
        // if (strokematerial) {
        //   this.material = strokematerial
        //   parent.addMesh(this)
        //   //if (params.transform) SVGShapeUtils.processTransform(this, params.transform)
        // }

        // // fillmesh: a separate mesh that will use texture as material.map
        // const fillmaterial = this.getFillMaterial()
        // if (fillmaterial) {
        const mesh = new Mesh()
        mesh.name = 'image-fill'
        mesh.position.z = svg.zfix
        parent.addMesh(mesh)
        this.fillmesh = mesh
        //   //if (params.transform) SVGShapeUtils.processTransform(mesh, params.transform)
        // }

        // ensure we have an id to cache/retrieve textures
        let id = params.elementId
        if (!id) id = 'image-' + new Date().getTime() + '-' + Math.floor(Math.random() * 10000)


        const setImageMaterial = (tex: Texture) => {
            if (!this.fillmesh) return
            const mat = this.fillmesh.material as MeshBasicMaterial
            // prevent upside-down textures
            tex.flipY = false
            mat.map = tex
            tex.wrapS = tex.wrapT = RepeatWrapping

            mat.needsUpdate = true
            //this.applyPreserveAspect(tex, params.preserveAspectRatio)
        }


        // if texture already cached, apply it immediately
        const tex = svg.getImageById(id)
        if (tex) {
            setImageMaterial(tex)
        }


        // if href provided, load image texture and apply when ready
        if (params.href) {
            svg.loadImageTexture(id, params.href).then((tex) => {
                if (!tex) return
                setImageMaterial(tex);
            })
        }
    }
    href?: string
    elementId?: string
    //preserveAspectRatio?: string
    //transform?: string

    // width/height as ImageParams-compatible accessors
    get width(): number | string { return this._w }
    set width(v: number | string | undefined) {
        if (v === undefined) return
        const n = typeof v === 'string' ? SVGShapeUtils.parseFloatWithUnits(v, this.svg.width) || 0 : v
        this.w = n as number
    }
    get height(): number | string { return this._h }
    set height(v: number | string | undefined) {
        if (v === undefined) return
        const n = typeof v === 'string' ? SVGShapeUtils.parseFloatWithUnits(v, this.svg.height) || 0 : v
        this.h = n as number
    }

    private fillmesh?: Mesh

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

    private _w = 0
    get w(): number { return this._w }
    set w(newvalue: number) {
        if (newvalue != this._w) {
            this._w = newvalue
            if (!this.batch) this.update()
        }
    }

    private _h = 0
    get h(): number { return this._h }
    set h(newvalue: number) {
        if (newvalue != this._h) {
            this._h = newvalue
            if (!this.batch) this.update()
        }
    }

    override update() {
        // Build a rectangular Shape and use existing render helpers
        const x = this.x
        const y = this.y
        const w = this.w
        const h = this.h

        const shape = new Shape()
        shape.moveTo(x, y)
        shape.lineTo(x + w, y)
        shape.lineTo(x + w, y + h)
        shape.lineTo(x, y + h)
        shape.lineTo(x, y)

        this.geometry = this.renderStroke(shape)
        if (this.fillmesh) this.fillmesh.geometry = this.renderFill(shape)

        // position fillmesh center to match shape geometry (FixShapeUV will set UVs)
        if (this.fillmesh) {
            (this.fillmesh as Mesh).position.set(0, 0, this.svg.zfix)
        }
    }

    // private applyPreserveAspect(tex: Texture, preserve?: string) {
    //     if (!tex || !tex.image) return
    //     const imgW = (tex.image as any).width || 1
    //     const imgH = (tex.image as any).height || 1

    //     const w = this.w || 1
    //     const h = this.h || 1

    //     const mode = (preserve || 'xMidYMid meet').trim()
    //     if (mode === 'none') {
    //         tex.repeat.set(1, 1)
    //         tex.offset.set(0, 0)
    //         tex.needsUpdate = true
    //         return
    //     }

    //     const scaleX = w / imgW
    //     const scaleY = h / imgH
    //     let usedScale = Math.min(scaleX, scaleY)
    //     if (mode.indexOf('slice') >= 0) usedScale = Math.max(scaleX, scaleY)

    //     const displayW = imgW * usedScale
    //     const displayH = imgH * usedScale

    //     const repeatX = displayW / w
    //     const repeatY = displayH / h

    //     tex.repeat.set(repeatX, repeatY)
    //     const offsetX = (1 - repeatX) / 2
    //     const offsetY = (1 - repeatY) / 2
    //     tex.offset.set(offsetX, offsetY)
    //     tex.needsUpdate = true
    // }
}


