import {Shape, ShapeProperties} from "./Shape";
import {DirectionalMagnitude} from "../simulation/DirectionalMagnitude";

export interface CircleProperties extends ShapeProperties {
    radius: number;
}

export class Circle extends Shape<CircleProperties> {

    public get radius(): number {
        return this.properties.radius;
    };

    public set radius(radius: number){
        this.properties.radius = radius;
    };

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


    public withinBounds(coords: DirectionalMagnitude): boolean {
        const xDistance = coords.x - this.x;
        const yDistance = coords.y - this.y;

        const distance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));

        return distance < this.radius;
    }
}