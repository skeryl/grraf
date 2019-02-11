import {DirectionalMagnitude} from "../simulation/DirectionalMagnitude";
import {Color} from "./Color";
import {ColorStop} from "./LinearGradient";
import {FillStyle} from "./FillStyle";
import {Gradient, gradientFillStyle} from "./Gradient";

export class RadialGradient implements FillStyle, Gradient {

    public readonly colorStops: ColorStop[] = [];

    constructor(
        /**
         * coordinates of the start point of the gradient.
         */
        public readonly start: DirectionalMagnitude,
        public readonly startRadius: number,

        /**
         * coordinates of the end point of the gradient.
         */
        public readonly end: DirectionalMagnitude,
        public readonly endRadius: number,
    ){}

    addColorStop(color: string | Color, offset: number = (this.colorStops.length/this.colorStops.length+1)): RadialGradient {
        this.colorStops.push({
            color: color instanceof Color ? color.fillStyle() : color,
            offset
        });
        return this;
    }

    toCanvasGradient(ctx: CanvasRenderingContext2D): CanvasGradient {
        return ctx.createRadialGradient(this.start.x, this.start.y, this.startRadius, this.end.x, this.end.y, this.endRadius);
    }

    fillStyle(ctx: CanvasRenderingContext2D): CanvasGradient {
        return gradientFillStyle(this, ctx);
    }
}