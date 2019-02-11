import {ColorStop} from "./LinearGradient";

export interface Gradient {
    readonly colorStops: ColorStop[];
    toCanvasGradient(ctx: CanvasRenderingContext2D): CanvasGradient;
}

export function gradientFillStyle<T extends Gradient>(gradient: T, ctx: CanvasRenderingContext2D): CanvasGradient {
    const canvasGradient = gradient.toCanvasGradient(ctx);
    gradient.colorStops.forEach(colorStop => {
        canvasGradient.addColorStop(colorStop.offset, colorStop.color);
    });
    return canvasGradient;
}