import {Shape, SizeFunction} from "./Shape";
import {Coordinates} from "../Coordinates";

export class Text extends Shape {

    private _maxWidth: number | undefined;
    private _text: string = "";

    maxWidth = (): number | undefined => {
        return this._maxWidth;
    };

    public setMaxWidth = (maxWidth: number | SizeFunction): Text  => {
        return this.setValue(maxWidth, "_maxWidth") as Text;
    };

    text = (): string => {
        return this._text;
    };

    public setText = (text: string): Text => {
        this._text = text;
        return this;
    };

    drawShape(){
        this.context.fillText(this.text(), this.x, this.y, this.maxWidth());
    }

    public withinBounds(coords: Coordinates): boolean {
        const {x, y} = coords;

        const boundsRight = this.x + 10;
        const boundsLeft = this.x - 10;

        const boundsTop = this.y - 10;
        const boundsBottom = this.y + 10;

        return x < boundsRight && x > boundsLeft &&
            y > boundsTop && y < boundsBottom;
    }

}