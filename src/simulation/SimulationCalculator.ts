import {Environment, ForceMap, NearbyParticle} from "./Environment";
import {IParticle, Particle} from "./Particle";
import {add, Direction, DirectionalMagnitude, ZERO} from "./DirectionalMagnitude";
import {ScalingMap} from "./ScalingMap";

type ParticleStep = {
    netForce: DirectionalMagnitude;
    acceleration: DirectionalMagnitude;
    velocity: DirectionalMagnitude;
    position: DirectionalMagnitude;
};

type StepResult = {
    [particleId: string]: ParticleStep
};

export type NearbyParticleMap = {
    [particleId: number]: NearbyParticle;
};

export type ParticleMatrix = {
    particles: { [particleId: number]: NearbyParticleMap };
    collisions: CollisionMap;
    forces: ForceMap;
};

type CollisionMap = {
    [particlesId: string]: { [particleId: string]: Collision };
}

interface SimulationStep {
    particles: StepResult;
    collisions: CollisionMap;
}

type StepIncrements = 1 | 10 | 20 | 50 | 100 | 1000;

function nearestIncrement(atTime: number, interval: number): number {
    const intervalCount = Math.floor(atTime / interval);
    return intervalCount * interval;
}

export class SimulationBuffer {

    private lastRequested: number = 0;
    private lastComputed: number = 0;

    private running: boolean = false;

    private readonly calculator: SimulationCalculator = new SimulationCalculator(this.environment, this.stepTimeMilliseconds, 2 * (this.bufferMilliseconds / this.stepTimeMilliseconds ));

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

    public calculate(time: number): SimulationStep {
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

export function toShallowParticle(particle: Particle): IParticle {
    return {
        id: particle.id,
        physicalProperties: particle.physicalProperties,
        acceleration: {...particle.acceleration},
        velocity: {...particle.velocity},
        position: { ...particle.position },
        environment: particle.environment,
        boundary(position: DirectionalMagnitude, theta: number): DirectionalMagnitude {
            return particle.boundary(position, theta);
        }
    };
}

type ParticlesById = { [particleId: string]: IParticle };

export class SimulationCalculator {

    private stepCache: ScalingMap<number, SimulationStep> = new ScalingMap<number, SimulationStep>(this.cacheSize);
    // private particles: ParticlesById;

    constructor(
        private readonly environment: Environment,
        private readonly stepTimeMilliseconds: StepIncrements = 50,
        private readonly cacheSize: number = 5000,
    ){
       /* this.particles = environment.particles
            .map(toShallowParticle)
            .reduce((result: ParticlesById, particle: IParticle) => {
                result[particle.id.toString()] = particle;
                return result;
            },
            {} as ParticlesById
            );*/
    }

    private getInitialState(): SimulationStep {
        return Object.keys(this.environment.particles).reduce((result: SimulationStep, particleId: string) => {

            const particle = this.environment.getParticle(particleId);

            result.particles[particleId] = {
                netForce: ZERO,
                velocity: particle.physicalProperties.initialVelocity,
                acceleration: particle.physicalProperties.initialAcceleration,
                position: particle.physicalProperties.position,
            };

            return result;
        }, {
            particles: {},
            collisions: {},
        });
    }

    // return a Map from particle ID to the "things to do" to the particle at that moment in time
    private calculateStep(timeStamp: number): SimulationStep {
        if(this.stepCache.has(timeStamp)){
            return this.stepCache.get(timeStamp) as SimulationStep;
        }

        console.log(`calc: ${timeStamp}`);

        if(timeStamp <= 0){
            const initialState = this.getInitialState();
            this.stepCache.set(0, initialState);
            return initialState;
        }

        const lastStep = this.calculateStep(timeStamp - this.stepTimeMilliseconds);

        const particleMatrix: ParticleMatrix = Object.values(this.environment.particles).reduce((result: ParticleMatrix, particle) => {

            const { nearby } = this.environment.recalculateParticleForces(particle, result.forces);

            result.particles[particle.id] = nearby.reduce((info: NearbyParticleMap, nearby: NearbyParticle) => {

                info[nearby.particle.id] = nearby;

                if(!SimulationCalculator.collisionAlreadyReported(result.collisions, particle, nearby.particle)){
                    const possibleCollision = SimulationCalculator.collisionCheck(lastStep, particle, nearby.particle);
                    if(possibleCollision){
                        SimulationCalculator.addCollision(result.collisions, possibleCollision);
                    }
                }

                return info;
            }, {
            });

            return result;
        }, {
            particles: {},
            collisions: {},
            forces: {},
        });

        const stepResult = Object.keys(particleMatrix.particles)
            .reduce((result: SimulationStep, particleId: string) => {

                const particle = this.environment.getParticle(particleId);

                const collisionVelocity = this.getCollisionVelocity(particle.id, particleMatrix);

                const netForce = (particleId in particleMatrix.forces) ? particleMatrix.forces[particleId].reduce(add, ZERO) : ZERO;

                const previous = SimulationCalculator.getPreviousState(lastStep, particle);

                const seconds = this.stepTimeSeconds;

                const acceleration = collisionVelocity ? ZERO : SimulationCalculator.getAcceleration(netForce, particle);

                const velocity = collisionVelocity ? collisionVelocity : SimulationCalculator.getUpdatedVelocity(previous, acceleration, seconds);

                const position = SimulationCalculator.getUpdatedPosition(previous, velocity, seconds);

                result.particles[particleId] = {
                    netForce,
                    acceleration,
                    velocity,
                    position
                };

                return result;
            },
            {
                particles: {},
                collisions: particleMatrix.collisions,
            });

        this.stepCache.set(timeStamp, stepResult);

        return stepResult;
    }

    private getCollisionVelocity(particleId: number, particleMatrix: ParticleMatrix): DirectionalMagnitude | undefined {
        if (particleId in particleMatrix.collisions) {
            const particleCollisions = particleMatrix.collisions[particleId];
            return Object.values(particleCollisions).reduce((velocity, collision) => {
                return add(velocity, collision[particleId]);
            }, ZERO);
        }
        return undefined;
    }

    private static collisionAlreadyReported(info: CollisionMap, particle: IParticle, nearby: IParticle): boolean {
        if (nearby.id in info) {
            const othersCollisions = info[nearby.id];
            if (particle.id in othersCollisions) {
                return true;
            }
        }
        return false;
    }

    private static getAcceleration(netForce: DirectionalMagnitude, particle: IParticle) {
        return {
            x: (netForce[Direction.x] / particle.physicalProperties.mass),
            y: (netForce[Direction.y] / particle.physicalProperties.mass),
        };
    }

    private static getUpdatedVelocity(previous: ParticleStep, acceleration: DirectionalMagnitude, seconds: number) {
        return {
            x: previous.velocity.x + (acceleration.x * seconds),
            y: previous.velocity.y + (acceleration.y * seconds),
        };
    }

    private static getUpdatedPosition(previous: ParticleStep, velocity: DirectionalMagnitude, seconds: number) {
        return {
            x: previous.position.x + (velocity.x * seconds),
            y: previous.position.y + (velocity.y * seconds),
        };
    }

    public calculate(millisFromStart: number): SimulationStep {

        const timeStamp = nearestIncrement(millisFromStart, this.stepTimeMilliseconds);

        const calculateStep = this.calculateStep(timeStamp);

        if(!calculateStep){
            throw new Error(`Unable to calculate a StepResult at time ${millisFromStart}. For best results, supply a number larger than zero and a clean multiple of the step increment (${this.stepTimeMilliseconds}ms)`);
        }

        return calculateStep;

    }

    get stepTimeSeconds():number {
        return this.stepTimeMilliseconds / 1_000;
    }

    private static getPreviousState(lastStep: SimulationStep | null, particle: IParticle): ParticleStep {

        if(lastStep){
            const particleStep = lastStep.particles[particle.id];
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

    private static collisionCheck(lastStep: SimulationStep, particle: IParticle, other: IParticle): Collision | undefined {
        if (this.hasCollision(lastStep, particle, other)) {
            return this.calculateCollision(particle, other);
        }
        return undefined;
    }

    private static hasCollision(lastStep: SimulationStep, particleA: IParticle, particleB: IParticle): Boolean {

        const aData = lastStep.particles[particleA.id];
        const bData = lastStep.particles[particleB.id];

        const theta = (Math.PI/2) - (Math.atan(aData.velocity.x / aData.velocity.y));

        const boundaryTowardsNearby = particleA.boundary(aData.position, theta);
        const boundaryAtIntersect = particleB.boundary(bData.position, (Math.PI) - theta);

        const xDiff = Math.abs(boundaryTowardsNearby.x - boundaryAtIntersect.x);
        const yDiff = Math.abs(boundaryTowardsNearby.y - boundaryAtIntersect.y);
        return xDiff <= 1 && yDiff <= 1;
    }

    private static calculateCollision(p1: IParticle, p2: IParticle): Collision {
        const m1 = p1.physicalProperties.mass;
        const m2 = p2.physicalProperties.mass;

        const v1 = p1.velocity;
        const v2 = p2.velocity;

        const combinedMass = m1 + m2;
        const massDifference = m1 - m2;

        return {
            [p1.id]: {
                x: (((massDifference) * v1.x) / (combinedMass)) + ((2 * m2 * v2.x) / (combinedMass)),
                y: (((massDifference) * v1.y) / (combinedMass)) + ((2 * m2 * v2.y) / (combinedMass)),
            },
            [p2.id]: {
                x: ((2 * m1 * v1.x) / (combinedMass)) - (((massDifference) * v2.x) / (combinedMass)),
                y: ((2 * m1 * v1.y) / (combinedMass)) - (((massDifference) * v2.y) / (combinedMass)),
            },
        };
    }

    private static addCollision(collisions: CollisionMap, collision: Collision) {
        const [particleA, particleB] = Object.keys(collision);

        if(!(particleA in collisions)){
            collisions[particleA] = {};
        }

        if(!(particleB in collisions)){
            collisions[particleB] = {};
        }

        collisions[particleA][particleB] = collision;
        collisions[particleB][particleA] = collision;
    }
}

export interface Collision {
    [particleId: string]: DirectionalMagnitude,
}
