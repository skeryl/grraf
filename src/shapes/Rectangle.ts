import {Shape, SizeFunction} from "./Shape";
import {Coordinates} from "../Coordinates";

export class Rectangle extends Shape {

    private w: number = 5;
    private h: number = 5;

    width(): number {
        return this.w;
    }

    public setWidth = (w: number | SizeFunction): Rectangle => {
        return this.setValue(w, "w") as Rectangle;
    };

    height(): number {
        return this.h;
    }

    public setHeight = (h: number | SizeFunction): Rectangle => {
        return this.setValue(h, "h") as Rectangle;
    };

    drawShape() {
        this.context.rect(this.x, this.y, this.w, this.h);
    }

    public withinBounds(coordinates: Coordinates): boolean {
        const {x, y} = coordinates;

        const boundsRight = this.x + this.w;
        const boundsLeft = this.x - this.w;

        const boundsTop = this.y - this.h;
        const boundsBottom = this.y + this.h;

        return x < boundsRight && x > boundsLeft &&
            y > boundsTop && y < boundsBottom;
    }

}