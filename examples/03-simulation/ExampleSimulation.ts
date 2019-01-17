import {Example} from "../index";
import {Stage} from "../../src/Stage";
import {Circle} from "../../src/shapes/Circle";
import {Color} from "../../src/Color";
import {Simulation} from "../../src/simulation/Simulation";
import {Environment} from "../../src/simulation/Environment";
import {Direction} from "../../src/simulation/DirectionalMagnitude";

const sexyPink = new Color(247, 24, 120);
const royalBlue = new Color(20, 20, 255);
const orangeJuice = new Color(240, 70, 20);

export class ExampleSimulation implements Example {

    private stage: Stage | undefined;
    private simulation: Simulation | undefined;

    start(window: Window, container: HTMLElement): void {

        this.stage = new Stage(container, true);

        const env = new Environment(this.stage, {
            coefficientOfFriction: 0.2,
            dimensions: {
                [Direction.x]: this.stage.canvas.width,
                [Direction.y]: this.stage.canvas.height,
            }
        });

        this.simulation = new Simulation(env);
/*
        this.simulation.environment.createParticle({
                mass: 5, // mass of human
                initialVelocity: {
                    [Direction.x]: 3,
                    [Direction.y]: 0,
                }
            },
            this.stage.createShape(Circle).setRadius(5)
                .setPosition({ x: window.innerWidth / 2, y: 500})
                .setColor(sexyPink),
        );

        this.simulation.environment.createParticle({
                mass: 5, // mass of human
                initialVelocity: {
                    [Direction.x]: 0,
                    [Direction.y]: 3,
                }
            },
            this.stage.createShape(Circle).setRadius(5)
                .setPosition({ x: 800 , y: window.innerHeight / 2 })
                .setColor(royalBlue),
        );
        this.simulation.environment.createParticle({
                mass: 5, // mass of human
                initialVelocity: {
                    [Direction.x]: 2,
                    [Direction.y]: 0.01,
                }
            },
            this.stage.createShape(Circle).setRadius(5)
                .setPosition({ x: 800 , y: 400})
                .setColor(sexyPink),
        );

        this.simulation.environment.createParticle({
                mass: 5, // mass of human
                initialVelocity: {
                    [Direction.x]: 0,
                    [Direction.y]: -1,
                }
            },
            this.stage.createShape(Circle).setRadius(5)
                .setPosition({ x: 300, y: 800})
                .setColor(royalBlue),
        );*/

        const earth = this.simulation.environment.createParticle({
                mass: (6 * Math.pow(10,23)), // mass of earth
                initialVelocity: {
                    x: 0,
                    y: 0,
                }
            },
            this.stage.createShape(Circle)
                .setRadius(50)
                .setPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
                .setColor(royalBlue)
        );

        const earth2 = this.simulation.environment.createParticle({
                mass: (6 * Math.pow(10,23)), // mass of earth
                initialVelocity: {
                    x: 0,
                    y: 0,
                }
            },
            this.stage.createShape(Circle)
                .setRadius(50)
                .setPosition({ x: window.innerWidth / 2, y: earth.y - 105 })
                .setColor(orangeJuice)
        );

        //this.simulation.environment.stage.scale(0.5, 0.5);
        this.simulation.setSpeed(0.5);

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