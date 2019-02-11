import {Example} from "../index";
import {Stage} from "../../src/Stage";
import {Circle} from "../../src/shapes/Circle";
import {Color} from "../../src/color/Color";
import {Simulation} from "../../src/simulation/Simulation";
import {Environment} from "../../src/simulation/Environment";
import {Direction} from "../../src/simulation/DirectionalMagnitude";
import {Rectangle} from "../../src/shapes/Rectangle";

const sexyPink = new Color(247, 24, 120);
const royalBlue = new Color(20, 20, 255);
const orangeJuice = new Color(240, 70, 20);

export class ExampleSimulation implements Example {

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
            }
        });

        this.simulation = new Simulation(env);

        const halfPageWidth = window.innerWidth / 4;
        const halfPageHeight = window.innerHeight / 4;

        const r = 30;
        const earth = this.simulation.environment.createParticle({
                mass: (6 * Math.pow(10,23)), // mass of earth
                position: { x: halfPageWidth - (r/2), y: halfPageHeight - (r/2) }
            },
            this.stage.createShape(Circle).setRadius(r).setColor(sexyPink)
        );

        const smallMass = earth.physicalProperties.mass / 1000;

        this.simulation.environment.createParticle({
                mass: smallMass,
                initialVelocity:    { x: 3,       y: 0             },
                position:           { x: earth.x, y: earth.y - 200 },
            },
            this.stage.createShape(Circle).setRadius(7).setColor(sexyPink),
        );

        this.simulation.environment.createParticle({
                mass: smallMass,
                initialVelocity:    { x: 2.12132034356,           y: 2.12132034356           },
                position:           { x: earth.x + 141.421356237, y: earth.y - 141.421356237 },
            },
            this.stage.createShape(Circle).setRadius(7).setColor(sexyPink),
        );

        this.simulation.environment.createParticle({
                mass: smallMass,
                initialVelocity:    { x: 2.12132034356,           y: -2.12132034356           },
                position:           { x: earth.x - 141.421356237, y: earth.y - 141.421356237 },
            },
            this.stage.createShape(Circle).setRadius(7).setColor(sexyPink),
        );

        this.simulation.environment.createParticle({
                mass: smallMass,
                initialVelocity:    { x: -2.12132034356,           y: 2.12132034356           },
                position:           { x: earth.x + 141.421356237, y: earth.y + 141.421356237 },
            },
            this.stage.createShape(Circle).setRadius(7).setColor(sexyPink),
        );

        this.simulation.environment.createParticle({
                mass: smallMass,
                initialVelocity:    { x: -3,        y: 0             },
                position:           { x: earth.x,   y: earth.y + 200 },
            },
            this.stage.createShape(Circle).setRadius(7).setColor(sexyPink),
        );

        this.simulation.environment.createParticle({
                mass: smallMass,
                initialVelocity:    { x: -2.12132034356,           y: -2.12132034356           },
                position:           { x: earth.x - 141.421356237, y: earth.y + 141.421356237 },
            },
            this.stage.createShape(Circle).setRadius(7).setColor(sexyPink),
        );

        this.simulation.environment.createParticle({
                mass: smallMass,
                initialVelocity:    { x: 0,             y: 3       },
                position:           { x: earth.x + 200, y: earth.y },
            },
            this.stage.createShape(Circle).setRadius(7).setColor(sexyPink),
        );

        this.simulation.environment.createParticle({
                mass: smallMass,
                initialVelocity:    { x: 0,             y: -3      },
                position:           { x: earth.x - 200, y: earth.y },
            },
            this.stage.createShape(Circle).setRadius(7).setColor(sexyPink),
        );

        this.simulation.setSpeed(10);
        this.simulation.environment.stage.scale(2, 2);

        this.simulation.start();
    }

    stop(): void {
        if (this.simulation) {
            this.simulation.stop();
        }
    }

    name = "Physics Simulation";
    description = "Make all your friends jealous with delicious animation.";

}