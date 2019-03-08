import {Environment, ForceMap, NearbyParticle} from "./Environment";
import {IParticle, Particle} from "./Particle";
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

    private readonly calculator: SimulationCalculator = new SimulationCalculator(this.environment, this.stepTimeMilliseconds /*, 10 * (this.bufferMilliseconds / this.stepTimeMilliseconds )*/);

    constructor(
        private readonly environment: Environment,
        private readonly stepTimeMilliseconds: number = 1000,
        private readonly bufferMilliseconds: number = 1_000,
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
            } else {
                console.log(`calculated up to ${this.lastComputed}ms; waiting for simulation to catch up.`);
            }
            window.requestAnimationFrame(this.tick.bind(this));
        }
    }

    public calculate(time: number): SimulationStep {
        this.lastRequested = time;
        return this.calculator.calculate(time);
    }

}

export function toShallowParticle(particle: Particle): IParticle {
    return {
        id: particle.id,
        physicalProperties: particle.physicalProperties,
        acceleration: {...particle.acceleration},
        velocity: {...particle.velocity},
        position: { ...particle.position },
        environment: particle.environment,
        boundary(othersPosition: DirectionalMagnitude, position: DirectionalMagnitude, theta: number): DirectionalMagnitude {
            return particle.boundary(othersPosition, position, theta);
        }
    };
}

export class SimulationCalculator {

    private stepCache: Map<number, SimulationStep> = new Map<number, SimulationStep>();

    constructor(
        private readonly environment: Environment,
        private readonly stepTimeMilliseconds: number = 50,
    ){
    }

    private getInitialState(): SimulationStep {
        return this.environment.particles.reduce((result: SimulationStep, particle: IParticle) => {
            result.particles[particle.id] = {
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

        if(timeStamp <= 0){
            const initialState = this.getInitialState();
            this.stepCache.set(0, initialState);
            return initialState;
        }

        const lastStep = this.calculateStep(timeStamp - this.stepTimeMilliseconds);

        const particleMatrix: ParticleMatrix = this.environment.particles.reduce((result: ParticleMatrix, particle) => {

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
        return this.calculateStep(timeStamp);
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
        const collisionAngle = this.hasCollision(lastStep, particle, other);
        if (collisionAngle) {
            return this.calculateCollision(particle, other, collisionAngle);
        }
        return undefined;
    }

    private static hasCollision(lastStep: SimulationStep, particleA: IParticle, particleB: IParticle): number | undefined {

        const aData = lastStep.particles[particleA.id];
        const bData = lastStep.particles[particleB.id];

        const theta = (Math.PI/2) - (Math.atan((aData.velocity.x - bData.velocity.x) / (aData.velocity.y - bData.velocity.y)));

        // NaN here means that there's no difference in either of the particles' velocities towards/away from each other
        // - in other words- they're either both stationary or both drifting at the same rate.
        if(Number.isNaN(theta)) {
            return undefined;
        }

        const boundaryForA = particleA.boundary(bData.position, aData.position, theta);
        const boundaryForB = particleB.boundary(aData.position, bData.position, (Math.PI) - theta);

        const xDiff = Math.abs(boundaryForA.x - boundaryForB.x);
        const yDiff = Math.abs(boundaryForA.y - boundaryForB.y);
        return xDiff <= 0.5 && yDiff <= 0.5 ? theta : undefined;
    }

    private static calculateCollision(p1: IParticle, p2: IParticle, angle: number): Collision {
        const m1 = p1.physicalProperties.mass;
        const m2 = p2.physicalProperties.mass;

        const v1 = p1.velocity;
        const v2 = p2.velocity;

        const combinedMass = m1 + m2;
        const massDifference = m1 - m2;

        const x1Prime = (((massDifference) * v1.x) / (combinedMass)) + ((2 * m2 * v2.x) / (combinedMass));
        const y1Prime = (((massDifference) * v1.y) / (combinedMass)) + ((2 * m2 * v2.y) / (combinedMass));

        const x2Prime = ((2 * m1 * v1.x) / (combinedMass)) - (((massDifference) * v2.x) / (combinedMass));
        const y2Prime = ((2 * m1 * v1.y) / (combinedMass)) - (((massDifference) * v2.y) / (combinedMass));

        const collision = {
            [p1.id]: {
                x: x1Prime,
                y: y1Prime,
            },
            [p2.id]: {
                x: x2Prime,
                y: y2Prime,
            },
        };

        if(angle < (Math.PI / 2)){

        }

        return collision;
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
