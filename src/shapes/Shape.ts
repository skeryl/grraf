import {Color} from "../color/Color";
import {Coordinates} from "../Coordinates";
import {MouseCallback, Stage} from "../Stage";
import {DirectionalMagnitude} from "../simulation/DirectionalMagnitude";
import {Fill, FillStyle} from "../color/FillStyle";

export class SizeStrategy {

    public static fullHeight = (canvas?: HTMLCanvasElement) => canvas ? canvas.height : window.innerHeight;

    public static fullWidth = (canvas?: HTMLCanvasElement) => canvas ? canvas.width : window.innerWidth;

}

export type SizeFunction = (canvas: HTMLCanvasElement) => number;

export class Shape {

    public strokeColor: FillStyle | undefined;
    public strokeWidth?: number;

    private clippingSources: Shape[] = [];
    private readonly mouseUpdateCallbacks: Array<MouseCallback> = [];
    private readonly mouseClickCallbacks: Array<MouseCallback> = [];
    private listeningToClicks: boolean = false;

    constructor(
        public readonly stage: Stage,
        public readonly id: number,
        protected readonly context: CanvasRenderingContext2D,
        public x: number,
        public y: number,
        public color: FillStyle = new Color(),
        private rotation?: number | undefined,
    ){
        this.drawShape = this.drawShape.bind(this);
        this.isPathLike = this.isPathLike.bind(this);
    }

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

    public withinBounds(position: Coordinates): boolean {
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

    // override if the shape is "path like" (started with context.beginPath() and closed with context.closePath())
    protected isPathLike(){
        return false;
    }

    public hasClipping = (): boolean => {
        return this.clippingSources.length > 0;
    };

    public resetClipping = (): Shape => {
        this.context.restore();
        this.clippingSources = [];
        return this;
    };

    public removeClipping = (clipper: Shape): Shape => {

        const clipIndex = this.clippingSources.findIndex(source => source.id === clipper.id);

        if(clipIndex >= 0){
            this.clippingSources.splice(clipIndex, 1);
        }

        return this;
    };

    public setClipping = (clipper: Shape): Shape => {

        // prevent the shape from being rendered normally
        this.stage.removeShape(clipper.id);

        // add it to this shape's clipping sources
        this.clippingSources.push(clipper);
        return this;
    };

    public get position(): DirectionalMagnitude {
        return { x: this.x, y: this.y };
    }

    public set position(position: DirectionalMagnitude) {
        this.x = position.x;
        this.y = position.y;
    }

    public setPosition = (position: Coordinates): Shape => {
        this.x = position.x;
        this.y = position.y;
        return this;
    };

    protected setValue(n: number | SizeFunction, prop: string): Shape {
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

    public setStrokeColor = (c: FillStyle): Shape => {
        this.strokeColor = c;
        return this;
    };

    public setStrokeWidth = (width: number): Shape => {
        this.strokeWidth = width;
        return this;
    };

    public setColor = (c: FillStyle): Shape => {
        this.color = c;
        return this;
    };

    public getColor(): FillStyle {
        return this.color;
    }

    public draw = () => {
        if(this.hasClipping()){
            this.context.restore();
        }
        this.context.save();

        if(this.strokeColor){
            this.context.strokeStyle = this.strokeColor.fillStyle(this.context);
        }
        if (this.strokeWidth !== undefined) {
            this.context.lineWidth = this.strokeWidth;
        }
        this.context.fillStyle = this.color.fillStyle(this.context);

        if(this.rotation !== undefined){
            this.context.translate(this.x, this.y);
            this.context.rotate(this.rotation as any as number);
            this.context.translate(-this.x, -this.y);
        }

        this.context.beginPath();
        this.drawShape();
        this.context.fill();
        if(this.strokeColor !== undefined || this.strokeWidth !== undefined || this.constructor.name === "Path"){
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

    rotate(r: number){
        this.rotation = r;
        return this;
    }

    drawShape(){};
}
