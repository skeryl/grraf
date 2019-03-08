import {DEFAULT_PROPERTIES, Shape, ShapeProperties, SizeFunction} from "./Shape";
import {DirectionalMagnitude} from "../simulation/DirectionalMagnitude";
import {Stage} from "../Stage";

export interface RectangleProperties extends ShapeProperties {
    width: number;
    height: number;
}

export const DEFAULT_RECT_PROPERTIES: RectangleProperties = {
  ...DEFAULT_PROPERTIES,
    width: 5,
    height: 5,
};

export class Rectangle extends Shape<RectangleProperties> {

    constructor(stage: Stage, id: number, initialProperties: Partial<RectangleProperties>) {
        super(stage, id, {
            ...DEFAULT_RECT_PROPERTIES,
            ...initialProperties,
        });
    }

    get width(): number {
        return this.properties.width;
    }

    get height(): number {
        return this.properties.height;
    }

    set width(width: number) {
        this.properties.width = width;
    }

    set height(height: number) {
        this.properties.height = height;
    }

    public setWidth = (w: number): this => {
        this.width = w;
        return this;
    };

    public setHeight = (h: number): this => {
        this.height = h;
        return this;
    };

    drawShape() {
        this.context.rect(this.x, this.y, this.width, this.height);
    }

    public withinBounds(coordinates: DirectionalMagnitude): boolean {
        const {x, y} = coordinates;

        const boundsRight = this.x + this.width;
        const boundsLeft = this.x - this.width;

        const boundsTop = this.y - this.height;
        const boundsBottom = this.y + this.height;

        return x < boundsRight && x > boundsLeft &&
            y > boundsTop && y < boundsBottom;
    }

}