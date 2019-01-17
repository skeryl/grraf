import {SimulationCalculator} from "../../src/simulation/SimulationCalculator";
import {Environment} from "../../src/simulation/Environment";
import {getTestEnvironment} from "../testUtils";

describe('SimulationCalculator', () => {

    test('should calculate step at time 0 to be the initial values', () => {

        const env: Environment = getTestEnvironment();

        const particle = env.createParticle({
            initialVelocity: { x: 5, y: 2 },
            mass: 200
        });

        const simulationCalculator = new SimulationCalculator(env);

        const stepResult = simulationCalculator.calculate(0);

        const particleStep = stepResult[particle.id];

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

        const particleStep = atOneSecond[particle.id];

        expect(particleStep.velocity).toEqual({x: 5, y: 0});
        expect(particleStep.position).toEqual({x: 5, y: 0});
    });

});