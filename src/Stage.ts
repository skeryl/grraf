import {Shape, ShapeConstructor, ShapeProperties} from "./shapes/Shape";
import {Color} from "./color/Color";
import {MouseInfo} from "./Mouse";
import {ShapeStore} from "./ShapeStore";
import {AnimationBuilder} from "./Animation";
import {DirectionalMagnitude} from "./simulation/DirectionalMagnitude";
import {FillStyle} from "./color";


export type Distance = DirectionalMagnitude & {
    total: number;
}

export interface NearbyShape {
    shape: Shape;
    distance: Distance;
}

export type MouseCallback = (e: MouseInfo) => void;

function createCanvas(container: HTMLElement): HTMLCanvasElement {
    const foundCanvas = container.querySelector("canvas");
    if(foundCanvas){
        return foundCanvas;
    }
    const doc = container.ownerDocument;
    if(!doc){
        throw new Error('Containing element must be anchored in a document.')
    }
    const canvasElement = doc.createElement("canvas");
    container.appendChild(canvasElement);
    return canvasElement;
}

export class Stage {

    private nextId: number = 0;

    public readonly shapes: ShapeStore = new ShapeStore();
    public readonly context: CanvasRenderingContext2D;
    private readonly mouseInfo: MouseInfo;

    private readonly mouseUpdateCallbacks: Array<MouseCallback> = [];
    private readonly mouseClickCallbacks: Array<MouseCallback> = [];

    private resizeFunctions: {[key: string]: {[key: string]: () => void }} = {
    };

    public readonly canvas: HTMLCanvasElement;

    public static createOffscreen(canvasSettings?: Partial<HTMLCanvasElement>, resizeWithWindow: boolean = false, doc = document): Stage {
        const canvas = doc.createElement('canvas');
        if(canvasSettings){
            Object.keys(canvasSettings).forEach(key => {
                (canvas as any)[key] = (canvasSettings as any)[key];
            });
        }
        return new Stage(canvas, resizeWithWindow);
    }

    constructor(canvasOrContainer: HTMLCanvasElement | (HTMLElement | null),
                public readonly resizeWithWindow: boolean = false,
                private readonly extraHeight: number = 0
    ){
        this.canvas = (canvasOrContainer instanceof HTMLCanvasElement) ? canvasOrContainer : createCanvas(canvasOrContainer as HTMLElement);

        window.addEventListener("resize", this.onResize);
        this.onResize();

        const ctx = this.canvas.getContext("2d");
        if(!ctx){
            throw new Error("grraf must be used in a browser that supports HTML Canvas rendering.");
        }
        this.context = ctx;
        this.context.imageSmoothingEnabled = true;

        let updateMouse = (mouseInfo: MouseInfo) => {
            this.mouseUpdateCallbacks.forEach(callback => {
                callback(mouseInfo);
            });
        };

        let mouseClicked = (mouseInfo: MouseInfo) => {
            this.mouseClickCallbacks.forEach(cb => cb(mouseInfo));
        };

        this.mouseInfo = new MouseInfo(document, this.canvas, updateMouse, mouseClicked);
    }

    onResize = () => {

        if(this.resizeWithWindow){
            this.canvas.height = window.innerHeight + this.extraHeight;
            this.canvas.width = window.innerWidth;
        }

        Object.getOwnPropertyNames(this.resizeFunctions).forEach(shapeId => {
            const shapeResizeFuncs = this.resizeFunctions[shapeId];
            Object.getOwnPropertyNames(shapeResizeFuncs).forEach(propName => {
                shapeResizeFuncs[propName].apply(null);
            });
        });

        this.draw();
    };

    onMouseUpdate(callback: MouseCallback){
        this.mouseUpdateCallbacks.push(callback);
        return this;
    }

    onMouseClick(callback: MouseCallback){
        this.mouseClickCallbacks.push(callback);
        return this;
    }

    setResize = (shape: Shape, prop: string, sizeFunc: () => void) => {

        if(!(shape.id in this.resizeFunctions)){
            this.resizeFunctions[shape.id.toString()] = {};
        }

        this.resizeFunctions[shape.id.toString()][prop] = sizeFunc;
    };

    public scale(x: number, y: number): Stage {
        this.context.scale(x, y);
        return this;
    }

    public setShapeLayer(shape: Shape, layer: number){
        this.shapes.set(shape, layer);
    }

    createShape<T extends Shape<TProperties>, TProperties extends ShapeProperties>(
        T: ShapeConstructor<TProperties, T>,
        properties: Partial<TProperties> = {},
    ): T {
        const shape: T = new T(this, this.nextId++, properties);
        this.shapes.set(shape, shape.layer);
        return shape;
    }

    getShape(id: number){
        return this.shapes.getShape(id);
    }

    public animate<T extends Shape>(shape: T){
        return new AnimationBuilder<T>(this, shape);
    }

    // ToDo, make generic for "n" dimensions
    getShapesNear = (position: DirectionalMagnitude, radius?: number): NearbyShape[] => {

        const {x, y} = position;
        const result: NearbyShape[] = [];

        this.shapes.forEach(shape => {
            const xDistance = x - shape.x;
            const yDistance = y - shape.y;

            const distance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));

            if(!radius || distance < radius){
                result.push({
                    shape,
                    distance: { x: xDistance, y: yDistance, total: distance }
                });
            }
        });

        return result;
    };

    removeShape(shape: Shape): Stage {
        this.shapes.removeShape(shape);
        return this;
    }

    getSize(): {
        height: number, width: number
    } {
        return {
            height: this.canvas.height,
            width: this.canvas.width
        };
    }

    drawStage(otherStage: Stage, destinationOffset: DirectionalMagnitude = { x: 0, y: 0 }): void {
        this.context.drawImage(otherStage.canvas, destinationOffset.x, destinationOffset.y);
    }

    draw(){
        this.clear();
        this.shapes.forEach(shape => shape.draw());
        return this;
    }

    clear(){
        if(this.context){
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        return this;
    }

}