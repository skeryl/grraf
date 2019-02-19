import {Animation} from "../Animation";
import {FillStyle} from "./FillStyle";

function wAvg(a: number, b: number, weight: number): number {
    const weightForA = (1 - weight);
    return Math.round((weightForA * a) + (weight * b));
}

export class Color implements FillStyle {

    constructor(
        private r: number = 0,
        private g: number = 0,
        private b: number = 0,
        private o: number = 1.0
    ){
        this.r = Color._colorSafe(r);
        this.g = Color._colorSafe(g);
        this.b = Color._colorSafe(b);
    }

    private static _colorSafe(c: number): number{
        return Math.floor(Math.min(255, Math.max(0, c), c));
    }

    private static _setColor(colorValue: number, container: Color, colorKey: string): Color {
        (<any>container)[colorKey] = Color._colorSafe(colorValue);
        return container;
    }

    public red = () => this.r;
    public setRed = (color: number): Color => {
        return Color._setColor(color, this, "r");
    };

    public green = () => this.g;
    public setGreen = (color: number): Color | number => {
        return Color._setColor(color, this, "g");
    };

    public blue = () => this.b;
    public setBlue = (color: number): Color | number => {
        return Color._setColor(color, this, "b");
    };

    public setOpacity = (o: number): Color => {
        this.o = o;
        return this;
    };

    public fillStyle = (ctx: CanvasRenderingContext2D | null = null, includeOpacity: boolean = true): string => {
        return includeOpacity ?
            `rgba(${this.r}, ${this.g}, ${this.b}, ${this.o.toFixed(2)})` :
            `rgb(${this.r}, ${this.g}, ${this.b})`;
    };

    public static combineColors(colorA: Color, colorB: Color, weight: number, ease: boolean = true): Color {

        const eased = ease ? Animation.Easing.EaseInOutCubic(weight) : weight;

        const r = wAvg(colorA.red() as number, colorB.red() as number, eased);
        const g = wAvg(colorA.green() as number, colorB.green() as number, eased);
        const b = wAvg(colorA.blue() as number, colorB.blue() as number, eased);

        return new Color(r, g, b);
    }
}