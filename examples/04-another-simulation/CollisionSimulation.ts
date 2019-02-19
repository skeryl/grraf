import {Example} from "../index";
import {Stage} from "../../src/Stage";
import {Circle} from "../../src/shapes/Circle";
import {Color} from "../../src/color";
import {Simulation} from "../../src/simulation/Simulation";
import {Environment} from "../../src/simulation/Environment";
import {Direction} from "../../src/simulation/DirectionalMagnitude";
import {Rectangle} from "../../src/shapes/Rectangle";

const sexyPink = new Color(247, 24, 120);
const orangeJuice = new Color(240, 70, 20);

export class CollisionSimulation implements Example {

    private stage: Stage | undefined;
    private simulation: Simulation | undefined;

    start(window: Window, container: HTMLElement): void {

        this.stage = new Stage(container, true);

        this.stage.createShape(Rectangle).setHeight(window.innerHeight).setWidth(window.innerWidth).setColor(new Color(255, 191, 168));

        const env = new Environment(this.stage, {
            coefficientOfFriction: 0.2,
            dimensions: {
                [Direction.x]: this.stage.canvas.width,
                [Direction.y]: this.stage.canvas.height,
            },
            isMeasuringGravity: false
        });

        this.simulation = new Simulation(env);

        const halfPageWidth = window.innerWidth / 2;
        const halfPageHeight = window.innerHeight / 2;

        const borderThickness = 20;

        const largeMass = 6*(10e20);
        const borderTop = env.createParticle(
            {
                mass: largeMass,
                position: {
                    x: halfPageWidth / 2,
                    y: halfPageHeight / 3,
                }
            },
            this.stage.createShape(Rectangle).setHeight(borderThickness).setWidth(halfPageWidth).setColor(orangeJuice)
        );

        const borderLeft = env.createParticle(
            {
                mass: largeMass,
                position: {
                    x: halfPageWidth / 2,
                    y: halfPageHeight / 3,
                }
            },
            this.stage.createShape(Rectangle).setHeight(halfPageHeight).setWidth(borderThickness).setColor(orangeJuice)
        );

        const borderBottom = env.createParticle(
            {
                mass: largeMass,
                position: {
                    x: halfPageWidth / 2,
                    y: halfPageHeight + borderTop.position.y - borderThickness,
                }
            },
            this.stage.createShape(Rectangle).setHeight(borderThickness).setWidth(halfPageWidth).setColor(orangeJuice)
        );

        const borderRight = env.createParticle(
            {
                mass: largeMass,
                position: {
                    x: halfPageWidth + (halfPageWidth / 2),
                    y: halfPageHeight / 3,
                }
            },
            this.stage.createShape(Rectangle).setHeight(halfPageHeight).setWidth(borderThickness).setColor(orangeJuice)
        );

        env.createParticle({
            mass: 100,
            position: { x: halfPageWidth, y:halfPageHeight },
            initialVelocity: { x: 20, y: 50 }
        }, this.stage.createShape(Circle).setRadius(10).setColor(sexyPink));

        this.simulation.setSpeed(1);

        this.simulation.start();
    }

    stop(): void {
        if (this.simulation) {
            this.simulation.stop();
        }
    }

    name = "Collision Simulation";
    description = "This doesn't really work yet but it will some day.";

}