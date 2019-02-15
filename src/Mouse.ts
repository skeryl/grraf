import {FixedPool} from "./FixedPool";
import {Coordinates} from "./Coordinates";
import {add, DirectionalMagnitude, ZERO} from "./simulation/DirectionalMagnitude";

function delta(a: number, b: number, timeMS: number): number {
    return (a - b) / timeMS;
}

export type MouseDown = {
    [button in MouseButton]: boolean;
}

enum MouseButton {
    left = 'left',
    right = 'right',
    middle= 'middle'
}

export class MouseInfo {

    private readonly deltas = new FixedPool<DirectionalMagnitude>(30, 100);

    private lastMeasurement: Date = new Date();

    private mouseDown: MouseDown = {
        left: false,
        middle: false,
        right: false
    };

    private x: number = 0;
    private y: number = 0;

    constructor(
        private readonly document: Document,
        private readonly canvas: HTMLCanvasElement,
        private readonly onUpdate: (e: MouseInfo) => void,
        private readonly onClick: (e: MouseInfo) => void
    ){

        document.addEventListener("mousemove", this.update);
        document.addEventListener("mouseenter", this.update);

        document.addEventListener("mousedown", (e) => this.update(e, true));
        document.addEventListener("mouseup", (e) => this. update(e, false));
    }

    isMouseDown(){
        return this.mouseDown.left || this.mouseDown.right || this.mouseDown.middle;
    }

    isLeftDown(){
        return this.mouseDown.left;
    }

    isRightDown(){
        return this.mouseDown.right;
    }

    isMiddleDown(){
        return this.mouseDown.middle;
    }

    velocity(): DirectionalMagnitude {
        return this.deltas.elements().reduce(add, ZERO);
    }

    position(): Coordinates {
        return { x: this.x, y: this.y };
    }

    setPosition(x: number, y: number): MouseInfo {
        this.x = x;
        this.y = y;
        return this;
    }

    public update = (event: MouseEvent, down?: boolean) => {

        const measurement = new Date();

        const button = event.button === 0 ? MouseButton.left : event.button === 2  ? MouseButton.right : event.button === 1 ? MouseButton.middle : undefined;

        if(button && down !== undefined){
            this.mouseDown[button] = down;
        }

        const bounds = this.canvas.getBoundingClientRect();

        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;

        const timeMS = measurement.getTime() - this.lastMeasurement.getTime();

        this.deltas.add({
            x: delta(x, this.x , timeMS),
            y: delta(y, this.y, timeMS)
        });

        this.setPosition(x, y);

        // ToDo: Determine if/when this is neccesary. Downside is that any non-canvas elements that hover over the
        //  space will be unclickable
        /*event.preventDefault();
        event.stopPropagation();*/

        this.lastMeasurement = measurement;

        if(down){
            this.onClick(this);
        }

        if((typeof this.onUpdate) === "function"){
            this.onUpdate(this);
        }

    };

}