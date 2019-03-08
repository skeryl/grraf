import {Shape, ShapeProperties, SizeFunction} from "./Shape";
import {DirectionalMagnitude} from "../simulation/DirectionalMagnitude";

export interface RectangleProperties extends ShapeProperties {
    width: number;
    height: number;
}

export class Rectangle extends Shape<RectangleProperties> {

    private w: number = 5;
    private h: number = 5;

    width(): number {
        return this.w;
    }

    height(): number {
        return this.h;
    }

    public setWidth = (w: number | SizeFunction): Rectangle => {
        return this.setValue(w, "w") as Rectangle;
    };

    public setHeight = (h: number | SizeFunction): Rectangle => {
        return this.setValue(h, "h") as Rectangle;
    };

    drawShape() {
        this.context.rect(this.x, this.y, this.w, this.h);
    }

    public withinBounds(coordinates: DirectionalMagnitude): boolean {
        const {x, y} = coordinates;

        const boundsRight = this.x + this.w;
        const boundsLeft = this.x - this.w;

        const boundsTop = this.y - this.h;
        const boundsBottom = this.y + this.h;

        return x < boundsRight && x > boundsLeft &&
            y > boundsTop && y < boundsBottom;
    }

}