import {Example} from "../index";
import {Stage} from "../../src/Stage";
import {Rectangle} from "../../src/shapes/Rectangle";
import {RadialGradient, LinearGradient, Color} from "../../src/color";
import {Path} from "../../src/shapes/Path";
import {DirectionalMagnitude} from "../../src/simulation/DirectionalMagnitude";
import {MouseInfo} from "../../src/Mouse";
import {Shape, ShapeProperties} from "../../src/shapes/Shape";

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

    constructor(stage: Stage, id: number, properties: Partial<ShapeProperties>) {
        super(stage, id, properties);

        this.path = this.stage.createShape(Path)
            .setLineCap("round")
            .setStrokeStyle(white);
    }

    setTarget(x: number, y: number): this {
        this.target = { x, y };
        return this;
    }

    setCpPosition(value: DirectionalMagnitude): this {
        this.cpPosition = value;
        return this;
    }

    drawShape() {
        this.path.resetPath();
        this.path.moveTo(this.x, this.y)
            .quadraticCurveTo(this.target.x, this.target.y, this.x + SEGMENT_LENGTH, this.y)
            .setStrokeWidth(this.strokeWidth || 1)
            .setStrokeStyle(white);
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

        const fill = new RadialGradient(
            {x: startingPosition.x + (BORDER_WIDTH/2), y: startingPosition.y + (BORDER_HEIGHT/2) },
            5,
            startingPosition,
            Math.max(BORDER_WIDTH, BORDER_HEIGHT) * 1.15
        )
            .addColorStop(aqua, 0)
            .addColorStop(pink, 1);

        const strokeStyle = new LinearGradient(startingPosition, {x: startingPosition.x + BORDER_WIDTH, y: startingPosition.y + BORDER_HEIGHT })
            .addColorStop(aqua, 0)
            .addColorStop(pink, 1);

        this.border = this.stage.createShape(Rectangle, {
            position: { x: startingPosition.x, y: startingPosition.y },
            layer: -1,
            width: BORDER_WIDTH,
            height: BORDER_HEIGHT,
            strokeWidth: 20,
            strokeStyle: strokeStyle
        })
            .setFill(fill);

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