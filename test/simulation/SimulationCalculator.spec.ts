import {Collision, SimulationCalculator} from "../../src/simulation/SimulationCalculator";
import {Environment} from "../../src/simulation/Environment";
import {getTestEnvironment} from "../testUtils";
import {Rectangle} from "../../src/shapes/Rectangle";

describe('SimulationCalculator', () => {

    test('should calculate step at time 0 to be the initial values', () => {

        const env: Environment = getTestEnvironment();

        const particle = env.createParticle({
            initialVelocity: { x: 5, y: 2 },
            mass: 200
        });

        const simulationCalculator = new SimulationCalculator(env);

        const stepResult = simulationCalculator.calculate(0);

        const particleStep = stepResult.particles[particle.id];

        expect(particleStep.velocity).toEqual({ x: 5, y: 2 });
        expect(particleStep.acceleration).toEqual({ x: 0, y: 0 });
    });

    test('should calculate distance travelled after 1000 ms correctly', () => {

        const env: Environment = getTestEnvironment();

        const particle = env.createParticle({
            position: {x: 0, y: 0},
            initialVelocity: {x: 5, y: 0},
            mass: 200
        });

        const simulationCalculator = new SimulationCalculator(env);

        const atOneSecond = simulationCalculator.calculate(1000);

        const particleStep = atOneSecond.particles[particle.id];

        expect(particleStep.velocity).toEqual({ x: 5, y: 0 });
        expect(particleStep.position).toEqual({ x: 5, y: 0 });
    });

    test('should calculate acceleration, velocity, distance values over time based on forces', () => {

        // The force due to gravity should be about 1 Newton for the below setup

        const env: Environment = getTestEnvironment({
            metersPerPixel: 20 // 50 pixels is one kilometer
        });

        env.createParticle({
            position: { x: 0, y: 0 },
            initialVelocity: {x: 0, y: 0},
            mass: 149866.618767 // kg
        });

        env.createParticle({
            position: { x: 50, y: 0 },
            initialVelocity: { x: 0, y: 0 },
            mass: (10**11) // kg
        });

        const simulationCalculator = new SimulationCalculator(env);

        const atOneSecond = simulationCalculator.calculate(1000);

        expect(atOneSecond.particles).toEqual({
            0:
                { netForce: { x: 1.000209813650958, y: 6.124518733817082e-17 },
                    velocity: { x: 0.000006673999999999998, y: 4.0866463687547176e-22 },
                    acceleration: { x: 0.000006674, y: 4.0866463687547176e-22 },
                    position: { x: 0.000003503849999999999, y: 2.145489343596227e-22 } },
            1:
                { netForce: { x: -1.000209813650958, y: 6.124518733817082e-17 },
                    velocity: { x: -1.0002098136509578e-11, y: 6.124518733817081e-28 },
                    acceleration: { x: -1.0002098136509581e-11, y: 6.124518733817082e-28 },
                    position: { x: 49.99999999999474, y: 3.2153723352539687e-28 } }
        });
    });

    test('should calculate basic head-on elastic collisions', () => {

        const env: Environment = getTestEnvironment({
            metersPerPixel: 20 // 50 pixels is one kilometer
        });

        const particleA = env.createParticle({
            position: { x: 0, y: 0 },
            initialVelocity: {x: 5, y: 0},
            mass: 10 // kg
        });

        const particleB = env.createParticle({
            position: { x: 50, y: 0 },
            initialVelocity: { x: -5, y: 0 },
            mass: 10 // kg
        });

        const simulationCalculator = new SimulationCalculator(env);
        let collision: Collision | undefined;

        for(let time = 0; time < 5000; time += 50){

            const atCollision = simulationCalculator.calculate(time);

            if(Object.keys(atCollision.collisions).length){

                expect(particleA.id in atCollision.collisions).toBeTruthy();
                expect(particleB.id in atCollision.collisions).toBeTruthy();

                const collisionA = atCollision.collisions[particleA.id][particleB.id];
                const collisionB = atCollision.collisions[particleB.id][particleA.id];

                expect(collisionA).toBeDefined();
                expect(collisionA).toBe(collisionB);
                collision = collisionA;
            }
        }
        expect(collision).toBeDefined();
        // cleanest way to appease dumbisense
        if(collision){
            expect(collision[particleA.id].x).toBe(-5);
            expect(collision[particleA.id].y).toBe(0);

            expect(collision[particleB.id].x).toBe(5);
            expect(collision[particleB.id].y).toBe(0);
        }
    });

    test('should calculate an elastic collision between a circle and rectangle', () => {

        const env: Environment = getTestEnvironment({
            metersPerPixel: 20, // 50 pixels is one kilometer,
            isMeasuringGravity: false,
        });

        const particle = env.createParticle({
            position: { x: 50, y: 50 },
            initialVelocity: { x: 1, y: 5 },
            mass: 10 // kg
        });

        const barA = env.createParticle({
                position: { x: 0, y: 0 },
                mass: 10**30 // kg
            },
            env.stage.createShape(Rectangle).setWidth(1000),
        );

        const barB = env.createParticle({
            position: { x: 0, y: 100 },
            mass: 10**30 // kg
        },
            env.stage.createShape(Rectangle).setWidth(1000),
        );

        const simulationCalculator = new SimulationCalculator(env);

        let collision: Collision | undefined;

        for(let time = 0; time < 10_000; time += 50){

            const atCollision = simulationCalculator.calculate(time);

            if(Object.keys(atCollision.collisions).length){
                expect(particle.id in atCollision.collisions).toBeTruthy();
                collision = atCollision.collisions[particle.id][barB.id];
            }
        }

        expect(collision).toBeDefined();
        // cleanest way to appease dumbisense
        if(collision){
            expect(collision[particle.id].x).toBe(-5);
            expect(collision[particle.id].y).toBe(0);

            expect(collision[barB.id].x).toBe(0);
            expect(collision[barB.id].y).toBe(0);
        }
    });

});