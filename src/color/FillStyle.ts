
export type Fill  = string | CanvasGradient | CanvasPattern;

export interface FillStyle {
    fillStyle(ctx: CanvasRenderingContext2D): Fill ;
}
