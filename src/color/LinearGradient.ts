
import {DirectionalMagnitude} from "../simulation/DirectionalMagnitude";
import {FillStyle} from "./FillStyle";
import {Color} from "./Color";
import {Gradient, gradientFillStyle} from "./Gradient";

export type ColorStop = { color: string, offset: number };

export class LinearGradient implements FillStyle, Gradient {

    public readonly colorStops: ColorStop[] = [];

    constructor(
        /**
         * coordinates of the start point of the gradient.
         */
        public readonly start: DirectionalMagnitude,
        /**
         * coordinates of the end point of the gradient.
         */
        public readonly end: DirectionalMagnitude,
    ){}

    addColorStop(color: string | Color, offset: number = (this.colorStops.length/this.colorStops.length+1)): LinearGradient {
        this.colorStops.push({
            color: color instanceof Color ? color.fillStyle() : color,
            offset
        });
        return this;
    }

    toCanvasGradient(ctx: CanvasRenderingContext2D): CanvasGradient {
        return ctx.createLinearGradient(this.start.x, this.start.y, this.end.x, this.end.y);
    }

    fillStyle(ctx: CanvasRenderingContext2D): CanvasGradient {
        return gradientFillStyle(this, ctx);
    }
}
