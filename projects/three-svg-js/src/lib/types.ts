export type Length = number | string;

export interface PresentationAttributes {
  // clipPath?: string;
  // clipRule?: string;
  // color?: string;
  // colorInterpolation?: string;
  // colorRendering?: string;
  // cursor?: string;
  // display?: string;
  fill?: string;
  // fillOpacity?: string;
  // fillRule?: string;
  // filter?: string;
  // mask?: string;
  // opacity?: string;
  // pointerEvents?: string;
  // shapeRendering?: string;
  // stroke?: string;
  // strokeDashArray?: string;
  // strokeDashOffset?: string;
  // strokeLineCap?: string;
  // strokeLineJoin?: string;
  // strokeMiterLimit?: string;
  // strokeOpacity?: string;
  // strokeWidth?: string;
  // transform?: string;
  // vectorEffect?: string;
  // visibility?: string;
}

export class RectParams implements PresentationAttributes {
  x?: Length;
  y?: Length;
  width?: Length;
  height?: Length;
  rx?: Length;
  ry?: Length;
  //pathLength?: number | "none";

  // presentation attributes
  // clipPath?: string;
  // clipRule?: string;
  // color?: string;
  // colorInterpolation?: string;
  // colorRendering?: string;
  // cursor?: string;
  // display?: string;
  fill?: string;
  // fillOpacity?: string;
  // fillRule?: string;
  // filter?: string;
  // mask?: string;
  // opacity?: string;
  // pointerEvents?: string;
  // shapeRendering?: string;
  // stroke?: string;
  // strokeDashArray?: string;
  // strokeDashOffset?: string;
  // strokeLineCap?: string;
  // strokeLineJoin?: string;
  // strokeMiterLimit?: string;
  // strokeOpacity?: string;
  // strokeWidth?: string;
  // transform?: string;
  // vectorEffect?: string;
  // visibility?: string;
}

export class CircleParams implements PresentationAttributes {
  cx?: Length;
  cy?: Length;
  r?: Length;
  //pathLength?: number | "none";

  // presentation attributes
  // clipPath?: string;
  // clipRule?: string;
  // color?: string;
  // colorInterpolation?: string;
  // colorRendering?: string;
  // cursor?: string;
  // display?: string;
  fill?: string;
  // fillOpacity?: string;
  // fillRule?: string;
  // filter?: string;
  // mask?: string;
  // opacity?: string;
  // pointerEvents?: string;
  // shapeRendering?: string;
  // stroke?: string;
  // strokeDashArray?: string;
  // strokeDashOffset?: string;
  // strokeLineCap?: string;
  // strokeLineJoin?: string;
  // strokeMiterLimit?: string;
  // strokeOpacity?: string;
  // strokeWidth?: string;
  // transform?: string;
  // vectorEffect?: string;
  // visibility?: string;
}

export class TextParams implements PresentationAttributes {
  x?: Length;
  y?: Length;
  dx?: Length;
  dy?: Length;
  rotate?: Array<number>;
  lengthAdjust?: "spacing" | "spacingAndGlpyhs";
  textLength?: Length;

  // style attributes
  // fontfamiliy?:string;
  fontSize?: number;
  // fontSizeAdjust?:number;
  // fontStretch?:number;
  // fontStyle?:string;
  // fontVariant?:string;
  // fontWeight?:string;

  // presentation attributes
  textAnchor?: 'start' | 'middle' | 'end';
  // clipPath?: string;
  // clipRule?: string;
  // color?: string;
  // colorInterpolation?: string;
  // colorRendering?: string;
  // cursor?: string;
  // display?: string;
  fill?: string;
  // fillOpacity?: string;
  // fillRule?: string;
  // filter?: string;
  // mask?: string;
  // opacity?: string;
  // pointerEvents?: string;
  // shapeRendering?: string;
  // stroke?: string;
  // strokeDashArray?: string;
  // strokeDashOffset?: string;
  // strokeLineCap?: string;
  // strokeLineJoin?: string;
  // strokeMiterLimit?: string;
  // strokeOpacity?: string;
  // strokeWidth?: string;
  // transform?: string;
  // vectorEffect?: string;
  // visibility?: string;
}
