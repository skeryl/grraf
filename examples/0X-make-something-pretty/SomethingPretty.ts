import {Example} from "../index";
import {Stage} from "../../src/Stage";
import {Rectangle} from "../../src/shapes/Rectangle";
import {Color} from "../../src/color/Color";
import {Path} from "../../src/shapes/Path";
import {DirectionalMagnitude} from "../../src/simulation/DirectionalMagnitude";
import {MouseInfo} from "../../src/Mouse";
import {Shape} from "../../src/shapes/Shape";
import {LinearGradient} from "../../src/color/LinearGradient";
import {RadialGradient} from "../../src/color/RadialGradient";

const SEGMENT_LENGTH = 20;

const pink = new Color(247, 24, 120);
const aqua = new Color(66, 229, 244);
const white = new Color(255, 255, 255);

const SEGMENT_SPACING = 4.5;
const VERTICAL_SPACING = 20;

const BORDER_WIDTH = 800;
const BORDER_HEIGHT = 800;


export class AnchoredSquiggle extends Shape {

    private path: Path;
    private target: DirectionalMagnitude = { x: this.x + SEGMENT_LENGTH, y: this.y };
    private cpPosition: DirectionalMagnitude= { x: this.target.x, y: this.target.y };

    constructor(stage: Stage, id: number, context: CanvasRenderingContext2D, x: number, y: number, color: Color) {
        super(stage, id, context, x, y, color);


        this.path = this.stage.createShape(Path)
            .setLineCap("round")
            .setStrokeColor(white) as Path;
    }

    setTarget(x: number, y: number): AnchoredSquiggle {
        this.target = { x, y };
        return this;
    }

    setCpPosition(value: DirectionalMagnitude): AnchoredSquiggle {
        this.cpPosition = value;
        return this;
    }

    drawShape() {
        this.path.resetPath();
        this.path.moveTo(this.x, this.y)
            .quadraticCurveTo(this.target.x, this.target.y, this.x + SEGMENT_LENGTH, this.y)
            .setStrokeWidth(this.strokeWidth || 1)
            .setStrokeColor(white);
        this.path.drawShape();
    }
}


export class SomethingPretty implements Example {

    private stage: Stage | undefined = undefined;
    private mouse: MouseInfo | undefined;
    private border: Shape | undefined;

    private squiggles: AnchoredSquiggle[] = [];

    start(window: Window, container: HTMLElement): void {

        this.stage = new Stage(container, true);

        const startingPosition = {
            x: (window.innerWidth - BORDER_WIDTH) / 2,
            y: (window.innerHeight - BORDER_HEIGHT) / 2,
        };

        this.border = this.stage.createShape(Rectangle, startingPosition.x, startingPosition.y, white, -1)
            .setHeight(BORDER_HEIGHT)
            .setWidth(BORDER_WIDTH)
            .setColor(
                new RadialGradient(
                    {x: startingPosition.x + (BORDER_WIDTH/2), y: startingPosition.y + (BORDER_HEIGHT/2) },
                    5,
                    startingPosition,
                    Math.max(BORDER_WIDTH, BORDER_HEIGHT) * 1.15
                )
                    .addColorStop(aqua, 0)
                    .addColorStop(pink, 1)
            )
            .setStrokeWidth(20)
            .setStrokeColor(
                new LinearGradient(startingPosition, {x: startingPosition.x + BORDER_WIDTH, y: startingPosition.y + BORDER_HEIGHT })
                    .addColorStop(aqua, 0)
                    .addColorStop(pink, 1)
            );

        const borderEdgeRight = BORDER_WIDTH + this.border.x;
        const borderEdgeDown = BORDER_HEIGHT + this.border.y;

        const initialX = this.border.position.x + (this.border.strokeWidth || 0);
        let next: DirectionalMagnitude | null = {
            x: initialX,
            y: this.border.position.y  + (this.border.strokeWidth || 0)
        };

        let count = 0;

        while(next !== null){
            const currentX: number = next.x + SEGMENT_LENGTH;
            const currentY: number = next.y;

            const squiggle = this.stage.createShape(AnchoredSquiggle)
                .setPosition({ x: next.x, y: next.y }) as AnchoredSquiggle;

            this.squiggles.push(squiggle);

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
            this.mouse = mouse;
            window.requestAnimationFrame(this.redrawLines);
        });

    }


    private redrawLines = (): void => {
        if(this.stage){
            if(this.border && this.mouse){
                const position = this.mouse.position();
                const velocity = this.mouse.velocity();
                // const width = Math.min(20,Math.max(1,Math.floor((velocity.x + velocity.y))));

                this.squiggles.forEach(squiggle => {
                    squiggle.setTarget(position.x, position.y)
                        .setCpPosition({ x: velocity.x, y: velocity.y })
                        .setStrokeWidth(1);
                });
            }
            this.stage.draw();
        }
        // window.requestAnimationFrame(this.redrawLines);
    };

    stop(): void {
        if(this.stage){
            this.stage.clear();
            this.stage = undefined;
        }
        this.squiggles = []
    }

    name: string = "Pretty Stuff";

    description: string = "An example that shows interaction, many shapes, and animation.";
}