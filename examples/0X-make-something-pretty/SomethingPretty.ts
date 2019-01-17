import {Example} from "../index";
import {Stage} from "../../src/Stage";
import {Rectangle} from "../../src/shapes/Rectangle";
import {Color} from "../../src/Color";
import {Path} from "../../src/shapes/Path";
import {DirectionalMagnitude} from "../../src/simulation/Simulation";

const NUM_ROWS = 30;
const NUM_COLS = 100;
const RECT_HEIGHT = 15;
const RECT_WIDTH = 10;

const SEGMENT_LENGTH = 20;

const pink = new Color(247, 24, 120);
const redOrange = new Color(221, 60, 2);
const aqua = new Color(66, 229, 244);
const white = new Color(255, 255, 255);

const spacing = 1.5;

const SEGMENT_SPACING = 4.5;
const VERTICAL_SPACING = 20;

const BORDER_WIDTH = 800;
const BORDER_HEIGHT = 800;

export class SomethingPretty implements Example {

    private stage: Stage | undefined = undefined;

    start(window: Window, container: HTMLElement): void {

        this.stage = new Stage(container, true);

        const startingPosition = {
            x: (window.innerWidth - BORDER_WIDTH) / 2,
            y: (window.innerHeight - BORDER_HEIGHT) / 2,
        };

        const border = this.stage.createShape(Rectangle, startingPosition.x, startingPosition.y, white, -1)
            .setHeight(BORDER_HEIGHT)
            .setWidth(BORDER_WIDTH)
            .setColor(white)
            .setStrokeWidth(10)
            .setStrokeColor(aqua);

        const initialX = border.position.x + (border.strokeWidth || 0);
        let next: DirectionalMagnitude | null = {
            x: initialX,
            y: border.position.y  + (border.strokeWidth || 0)
        };

        const borderEdgeRight = BORDER_WIDTH + border.x;
        const borderEdgeDown = BORDER_HEIGHT + border.y;

        let count = 0;

        while(next !== null/* && count < 10000*/){
            const currentX: number = next.x + SEGMENT_LENGTH;
            const currentY: number = next.y;

            this.stage.createShape(Path)
                .moveTo(next.x, next.y)
                .lineTo(currentX, currentY)
                .setLineCap("round")
                .setStrokeWidth(2)
                .setStrokeColor(redOrange);

            const nextX = currentX + SEGMENT_LENGTH + SEGMENT_SPACING;
            const nextY = currentY + VERTICAL_SPACING;

            const outsideBoundsX = nextX > borderEdgeRight;
            const outsideBoundsY = nextY > borderEdgeDown;

            next = (outsideBoundsX && outsideBoundsY) ? null :
                outsideBoundsX ? {
                    x: initialX,
                    y: nextY,
                } : {
                    x: nextX,
                    y: currentY,
                };
            count++;
        }

        this.stage.onMouseUpdate(mouse => {
            if(this.stage){
                const nearbyShapes = this.stage.getShapesNear(mouse.position());

                nearbyShapes.forEach(nearby => {

                    if(nearby.shape.constructor.name !== "Path"){
                        return;
                    }

                    const shape = nearby.shape as Path;

                    const y = nearby.distance.y;
                    const x = nearby.distance.x;
                    const riseOverRun = x === 0 ? 0 : (y / x);

                    const runOverRise = y === 0 ? 0 : (x / y);

                    const rotation = (runOverRise+riseOverRun)/2;

                    const factor = (riseOverRun < 1 ? riseOverRun : runOverRise);
                    shape.rotate(rotation * factor * Math.PI );
                });
                this.stage.draw();
            }
        });

        /*for(let rowIx = 0; rowIx < NUM_ROWS; rowIx++){
            for(let colIx = 0; colIx < NUM_COLS; colIx++){
                this.stage.createShape(Rectangle)
                    .setHeight(RECT_HEIGHT).setWidth(RECT_WIDTH)
                    .setColor(pink)
                    .setPosition({
                        x: startingPosition.x + (spacing*RECT_WIDTH*colIx),
                        y: startingPosition.y + (spacing*RECT_HEIGHT*rowIx)
                    });
            }
        }

        this.stage.onMouseUpdate(mouse => {
            if(this.stage){
                const nearbyShapes = this.stage.getShapesNear(mouse.position());

                nearbyShapes.forEach(nearby => {

                    const y = nearby.distance.y;
                    const x = nearby.distance.x;

                    const riseOverRun = x === 0 ? 0 : (y / x);
                    const runOverRise = y === 0 ? 0 : (x / y);

                    const rotation = (runOverRise+riseOverRun)/2;

                    const factor = (riseOverRun < 1 ? riseOverRun : runOverRise);
                    nearby.shape.setColor(
                        Math.abs(factor) < 0.5 ? pink : orangeJuice
                    );

                    nearby.shape.rotate(rotation * factor * Math.PI );
                });
                this.stage.draw();
            }
        });*/
        this.stage.draw();
    }

    stop(): void {
        if(this.stage){
            this.stage.clear();
            this.stage = undefined;
        }
    }

    name: string = "Pretty Stuff";

    description: string = "An example that shows interaction, many shapes, and animation.";

    private draw = () => {

    }
}