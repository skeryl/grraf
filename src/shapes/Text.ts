import {Shape, SizeFunction} from "./Shape";
import {DirectionalMagnitude} from "../simulation/DirectionalMagnitude";

export class Text extends Shape {

    public maxWidth: number | undefined;
    public text: string = "";
    public fontSize: number = 12;
    public fontFamily: string = "Arial";

    public setMaxWidth = (maxWidth: number | SizeFunction): Text  => {
        return this.setValue(maxWidth, "_maxWidth") as Text;
    };

    public setFontFamily(fontFamily: string): Text {
        this.fontFamily = fontFamily;
        return this;
    }

    public setFontSize(fontSize: number): Text {
        this.fontSize = fontSize;
        return this;
    }

    public setText = (text: string): Text => {
        this.text = text;
        return this;
    };

    drawShape(){
        this.context.font = `${this.fontFamily} ${this.fontSize}px`;
        this.context.fillText(this.text, this.position.x, this.position.y, this.maxWidth);
    }

    public withinBounds(coords: DirectionalMagnitude): boolean {
        const {x, y} = coords;

        const boundsRight = this.x + 10;
        const boundsLeft = this.x - 10;

        const boundsTop = this.y - 10;
        const boundsBottom = this.y + 10;

        return x < boundsRight && x > boundsLeft &&
            y > boundsTop && y < boundsBottom;
    }

}