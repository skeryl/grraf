import {Environment, ForceMap, NearbyParticle} from "./Environment";
import {NearbyParticleMap, ParticleMatrix} from "./Simulation";
import {IParticle} from "./Particle";
import {add, Direction, DirectionalMagnitude, ZERO} from "./DirectionalMagnitude";

type ParticleStep = {
    netForce: DirectionalMagnitude;
    acceleration: DirectionalMagnitude;
    velocity: DirectionalMagnitude;
    position: DirectionalMagnitude;
};

type StepResult = {
    [particleId: string]: ParticleStep
};

type StepIncrements = 1 | 10 | 20 | 50 | 100 | 1000;

function nearestIncrement(atTime: number, interval: number): number {
    const intervalCount = Math.floor(atTime / interval);
    return intervalCount * interval;
}

export class SimulationBuffer {

    private lastRequested: number = 0;
    private lastComputed: number = 0;

    private running: boolean = false;

    private readonly calculator: SimulationCalculator = new SimulationCalculator(this.environment, this.stepTimeMilliseconds);

    constructor(
        private readonly environment: Environment,
        private readonly stepTimeMilliseconds: StepIncrements = 50,
        private readonly bufferMilliseconds: number = 6_000,
    ){
    }

    public start(){
        if(this.running){
            return;
        }
        this.running = true;
        this.tick();
    }

    public stop(){
        if(!this.running){
            return;
        }
        this.running = false;
    }

    private tick(){
        if(this.running){
            if((this.lastComputed - this.lastRequested) < this.bufferMilliseconds){
                const timeStamp = this.lastComputed + this.stepTimeMilliseconds;
                this.calculator.calculate(timeStamp);
                this.lastComputed = timeStamp;
            }
            this.tick();
        }
    }

    public calculate(time: number): StepResult {
        this.lastRequested = time;
        return this.calculator.calculate(time);
    }


    /*private preBuffer() {
        return new Promise<void>(resolve => {
            for (let time = 0; time < this.preBufferMilliseconds; time += (this.stepTimeMilliseconds)) {
                this.calculator.calculate(time);
            }
            resolve();
        });
    }*/

}


export class SimulationCalculator {

    private stepCache: Map<number, StepResult> = new Map<number, StepResult>();

    constructor(
        private readonly environment: Environment,
        private readonly stepTimeMilliseconds: StepIncrements = 50,
    ){
    }

    // return a Map from particle ID to the "things to do" to the particle at that moment in time
    private calculateStep(timeStamp: number): StepResult | null {

        if(timeStamp < 0){
            return null;
        }

        if(this.stepCache.has(timeStamp)){
            return this.stepCache.get(timeStamp) as StepResult;
        }

        const lastStep = this.calculateStep(timeStamp - this.stepTimeMilliseconds);

        const forces: ForceMap = {};

        const nearbyMatrix: ParticleMatrix = this.environment.particles.reduce((result: ParticleMatrix, particle) => {

            const { nearby } = this.environment.recalculateParticleForces(particle, forces);

            result[particle.id] = nearby.reduce((map: NearbyParticleMap, nearby: NearbyParticle) => {
                map[nearby.particle.id] = nearby;
                return map;
            }, {});
            return result;
        }, {});

        const stepResult = Object.keys(nearbyMatrix)
            .reduce((result: StepResult, particleId: string) => {

                    const particle = this.environment.getParticle(particleId);

                    const netForce = (particleId in forces) ? forces[particleId].reduce(add, ZERO) : ZERO;

                    const previous = SimulationCalculator.getPreviousState(lastStep, particle);

                    const acceleration = {
                        x: (netForce[Direction.x] / particle.physicalProperties.mass),
                        y: (netForce[Direction.y] / particle.physicalProperties.mass),
                    };

                    const velocity = {
                        x: previous.velocity.x + (acceleration.x * this.stepTimeMilliseconds),
                        y: previous.velocity.y + (acceleration.y * this.stepTimeMilliseconds),
                    };

                    const position = {
                        x: previous.position.x + (velocity.x * this.stepTimeMilliseconds),
                        y: previous.position.y + (velocity.y * this.stepTimeMilliseconds),
                    };

                    result[particleId] = {
                        netForce,
                        velocity,
                        acceleration,
                        position
                    };

                    return result;
                },
                {}
            );

        this.stepCache.set(timeStamp, stepResult);

        return stepResult;
    }

    public calculate(millisFromStart: number): StepResult {

        const timeStamp = nearestIncrement(millisFromStart, this.stepTimeMilliseconds);

        const calculateStep = this.calculateStep(timeStamp);

        if(!calculateStep){
            throw new Error(`Unable to calculate a StepResult at time ${millisFromStart}. For best results, supply a number larger than zero and a clean multiple of the step increment (${this.stepTimeMilliseconds}ms)`);
        }

        return calculateStep;

    }

    private static getPreviousState(lastStep: StepResult | null, particle: IParticle): ParticleStep {

        if(lastStep){
            const particleStep = lastStep[particle.id];
            if(particleStep){
                return particleStep;
            }
        }

        return {
            netForce: ZERO,
            acceleration: particle.physicalProperties.initialAcceleration,
            velocity: particle.physicalProperties.initialVelocity,
            position: particle.position,
        };
    }
}