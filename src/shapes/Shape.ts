import {MouseCallback, Stage} from "../Stage";
import {DirectionalMagnitude} from "../simulation/DirectionalMagnitude";
import {FillStyle, Color} from "../color";

export class SizeStrategy {
    public static fullHeight = (canvas?: HTMLCanvasElement) => canvas ? canvas.height : window.innerHeight;
    public static fullWidth = (canvas?: HTMLCanvasElement) => canvas ? canvas.width : window.innerWidth;
}

export type SizeFunction = (canvas: HTMLCanvasElement) => number;

export interface ShapeProperties {
    layer: number;
    position: DirectionalMagnitude;
    fill: FillStyle;
    rotation?: number;
    strokeStyle?: FillStyle;
    strokeWidth?: number;
}

const DEFAULT_PROPERTIES: ShapeProperties = {
    layer: 0,
    position: {x: 0, y: 0 },
    fill: Color.black,
};

export type ShapeConstructor<TProperties extends ShapeProperties, TShape extends Shape<TProperties>> = { new(stage: Stage, id: number, properties: Partial<TProperties>): TShape }

export abstract class Shape<TProperties extends ShapeProperties = ShapeProperties> {

    private clippingSources: Shape[] = [];
    private readonly mouseUpdateCallbacks: Array<MouseCallback> = [];
    private readonly mouseClickCallbacks: Array<MouseCallback> = [];
    private listeningToClicks: boolean = false;

    protected readonly context: CanvasRenderingContext2D;
    public readonly properties: TProperties;

    constructor(
        public readonly stage: Stage,
        public readonly id: number,
        initialProperties: Partial<TProperties>
    ) {
        this.drawShape = this.drawShape.bind(this);
        this.isPathLike = this.isPathLike.bind(this);
        this.context = stage.context;
        this.properties = {
            ...DEFAULT_PROPERTIES,
            ...initialProperties,
        } as TProperties;
    }

    public get x(): number {
        return this.position.x;
    }

    public get y(): number {
        return this.position.y;
    }

    public get layer(): number {
        return this.properties.layer;
    };

    public set layer(layer: number) {
        this.stage.setShapeLayer(this, layer);
        this.properties.layer = layer;
    };

    public get position(): DirectionalMagnitude {
        return this.properties.position;
    };

    public set position(position: DirectionalMagnitude) {
        this.properties.position = position;
    }

    public get rotation(): number | undefined {
        return this.properties.rotation;
    };

    public set rotation(radians: number | undefined) {
        this.properties.rotation = radians;
    };

    public get fill(): FillStyle {
        return this.properties.fill;
    };

    public set fill(fill: FillStyle) {
        this.properties.fill = fill;
    };

    public get strokeStyle(): FillStyle | undefined {
        return this.properties.strokeStyle;
    };

    public set strokeStyle(stroke: FillStyle | undefined) {
        this.properties.strokeStyle = stroke;
    };

    public get strokeWidth(): number | undefined {
        return this.properties.strokeWidth;
    };

    public set strokeWidth(strokeWidth: number | undefined) {
        this.properties.strokeWidth = strokeWidth;
    };

    public withinBounds(position: DirectionalMagnitude): boolean {
        return false;
    }

    public onMouseUpdate(callback: MouseCallback){
        this.mouseUpdateCallbacks.push(callback);
        return this;
    }

    public onMouseClick(callback: MouseCallback){
        this.listenToClicks();
        this.mouseClickCallbacks.push(callback);
        return this;
    }

    public hasClipping = (): boolean => {
        return this.clippingSources.length > 0;
    };

    public resetClipping = (): this => {
        this.context.restore();
        this.clippingSources = [];
        return this;
    };

    public removeClipping = (clipper: Shape): this => {
        const clipIndex = this.clippingSources.findIndex(source => source.id === clipper.id);
        if(clipIndex >= 0){
            this.clippingSources.splice(clipIndex, 1);
        }
        return this;
    };

    public setClipping = (clipper: Shape): this => {
        // prevent the shape from being rendered normally
        this.stage.removeShape(clipper);
        // add it to this shape's clipping sources
        this.clippingSources.push(clipper);
        return this;
    };

    // override if the shape is "path like" (started with context.beginPath() and closed with context.closePath())
    protected isPathLike(){
        return false;
    }

    protected setValue(n: number | SizeFunction, prop: string): this {
        if(typeof n === "number"){
            (this as any)[prop] = n;
        } else if(typeof n === "function"){

            let sizingFunc = () => {
                (this as any)[prop] = (n as SizeFunction).call(null, this.stage.canvas);
            };

            this.stage.setResize(this, prop, sizingFunc);

            sizingFunc();
        }
        return this;
    }

    public setPosition(position: DirectionalMagnitude): this {
        this.position = position;
        return this;
    }

    public setStrokeStyle = (c: FillStyle): this => {
        this.strokeStyle = c;
        return this;
    };

    public setStrokeWidth = (width: number): this => {
        this.strokeWidth = width;
        return this;
    };

    public setColor = (fill: FillStyle): this => {
        this.fill = fill;
        return this;
    };

    public draw = () => {
        if(this.hasClipping()){
            this.context.restore();
        }
        this.context.save();

        if(this.strokeStyle){
            this.context.strokeStyle = this.strokeStyle.fillStyle(this.context);
        }
        if (this.strokeWidth !== undefined) {
            this.context.lineWidth = this.strokeWidth;
        }
        this.context.fillStyle = this.fill.fillStyle(this.context);

        if(this.rotation !== undefined){
            this.context.translate(this.position.x, this.position.y);
            this.context.rotate(this.rotation as any as number);
            this.context.translate(-this.position.x, -this.position.y);
        }

        this.context.beginPath();
        this.drawShape();
        this.context.fill();
        if(this.strokeStyle !== undefined || this.strokeWidth !== undefined || this.constructor.name === "Path"){
            this.context.stroke();
        }
        this.context.closePath();

        if(this.hasClipping()){

            this.context.beginPath();

            this.clippingSources.forEach(clipper => {
                clipper.drawShape();
                this.context.closePath();
            });

            this.context.clip();

        } else {
            this.context.restore();
        }
    };

    public rotate(radians: number){
        this.properties.rotation = radians;
        return this;
    }

    drawShape(){};

    private listenToClicks(){
        if(!this.listeningToClicks){
            this.stage.onMouseClick(mouseInfo => {
                if(this.withinBounds(mouseInfo.position())){
                    this.mouseClickCallbacks.forEach(callback => callback(mouseInfo));
                }
            });
            this.listeningToClicks = true;
        }
    };
}
