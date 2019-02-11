import {Example} from "../index";
import {Stage} from "../../src/Stage";
import {Rectangle} from "../../src/shapes/Rectangle";
import {Color} from "../../src/color/Color";
import {Circle} from "../../src/shapes/Circle";
import {Path} from "../../src/shapes/Path";

const sexyPink = new Color(247, 24, 120);
const royalBlue = new Color(20, 20, 255);
const uglyGreen = new Color(20, 200, 20);

export class BasicShapes implements Example {

    private stage: Stage | undefined = undefined;

    start(window: Window, container: HTMLElement): void {

        this.stage = new Stage(container, true);

        // a rectangle (20 x 40) and "sexy pink"
        const rectangle = this.stage.createShape(Rectangle)
            .setHeight(20).setWidth(40)
            .setColor(sexyPink)
            // these coordinates mark the center of the Rectangle
            .setPosition({
                x: 50,
                y: 50
            }) as Rectangle;

        // create a blue circle with a radius of 30 pixels!
        const circle = this.stage.createShape(Circle).setRadius(30).setColor(royalBlue)
            // and set the x position of the center a "safe" distance from the rectangle
            // (note how we use the rectangle's dimensions in the calculation)
            .setPosition({
                x: (rectangle.x + rectangle.width() + 10),
                y: rectangle.y
            }) as Circle;

        const squiggleX = circle.x + (1.5*circle.radius) + 10;

        // Just like in the SVG world Paths can create almost any shape
        const squiggle = this.stage.createShape(Path)
        // They're basically a "pen" that you can move around.
            .moveTo(squiggleX, circle.y)
            // They can be connected usting a straight line
            .lineTo(squiggleX + 25, circle.y - 25)
            // or arced/curved for smooth lines between points
            .arc(squiggleX, circle.y, 45, Math.PI, Math.PI / 2, true)
            .quadraticCurveTo(squiggleX + 100, circle.y - 25, squiggleX + 200, circle.y + 200)
            .quadraticCurveTo(squiggleX + 350, circle.y + 500, squiggleX + 500, circle.y + 300)
            // stroke width and color can be set
            .closePath() // <- closing the path will return the line to the starting position, closing the result into a shape
            .setColor(uglyGreen)
            .setStrokeWidth(2)
            .setPosition({ x: squiggleX, y: circle.y }); // <- this will control the starting position of the Path just like any other shape.

        this.stage.draw();
    }

    stop(): void {
        if(this.stage){
            this.stage.clear();
        }
    }

    name: string = "Basic Shapes";

    description: string = "An example that shows how basic shapes can be drawn. Note the sexy colors.";
}