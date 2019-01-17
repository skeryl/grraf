import {Color} from "../Color";
import {MouseInfo} from "../Mouse";
import {Shape} from "./Shape";
import {Coordinates} from "../Coordinates";

export class Circle extends Shape {

    public radius: number = 0;

    protected isPathLike(): boolean {
        return true;
    }

    public setRadius = (r: number): Circle => {
        this.radius = r;
        return this;
    };

    drawShape() {
        this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    };


    public withinBounds(coords: Coordinates): boolean {
        const xDistance = coords.x - this.x;
        const yDistance = coords.y - this.y;

        const distance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));

        return distance < this.radius;
    }
}