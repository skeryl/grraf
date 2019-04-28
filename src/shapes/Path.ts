import {Shape} from "./Shape";
import {DirectionalMagnitude} from "../simulation/DirectionalMagnitude";

export class Path extends Shape {

    private isClosed: boolean = false;
    private path: Path2D = new Path2D();
    private lineCapType: CanvasLineCap | undefined;

    protected isPathLike(): boolean {
        return true;
    }

    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): Path {
        this.path.arc(x, y, radius, startAngle, endAngle, anticlockwise);
        return this;
    }

    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): Path {
        this.path.arcTo(x1, y1, x2, y2, radius);
        return this;
    }

    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): Path {
        this.path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
        return this;
    }

    closePath(): Path {
        this.path.closePath();
        this.isClosed = true;
        return this;
    }

    ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise?: boolean): Path {
        this.path.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
        return this;
    }

    lineTo(x: number, y: number): Path {
        this.path.lineTo(x, y);
        return this;
    }

    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): Path {
        this.path.quadraticCurveTo(cpx, cpy, x, y);
        return this;
    }

    rect(x: number, y: number, w: number, h: number): Path {
        this.path.rect(x, y, w, h);
        return this;
    }

    moveTo(x: number, y: number): Path {
        this.path.moveTo(x, y);
        return this;
    }

    resetPath(): Path {
        this.path = new Path2D();
        this.isClosed = false;
        return this;
    }

    setPath(path: Path2D): this{
        this.path = path;
        return this;
    }

    setPathData(pathData: string): this {
        return this.setPath(new Path2D(pathData));
    }

    drawShape() {
        if(this.lineCapType){
            this.context.lineCap = this.lineCapType;
        }

        this.context.stroke(this.path);

        if(this.isClosed){
            this.context.fill(this.path);
        }
    }

    public withinBounds(coordinates: DirectionalMagnitude): boolean {
        return this.context.isPointInPath(this.path, coordinates.x, coordinates.y);
    }

    setLineCap(capType: CanvasLineCap): Path {
        this.lineCapType = capType;
        return this;
    }
}