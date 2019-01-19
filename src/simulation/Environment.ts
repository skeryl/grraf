import {IParticle, Particle} from "./Particle";
import {Distance, Stage} from "../Stage";
import {Shape} from "../shapes/Shape";
import {Circle} from "../shapes/Circle";
import {PhysicalProperties} from "./Simulation";
import {gravitationalForce} from "./calculations";
import {ForceLine} from "./ForceLine";
import {Direction, DirectionalMagnitude, equals, ZERO} from "./DirectionalMagnitude";

export interface EnvironmentalProperties {
    coefficientOfFriction: number;
    dimensions: DirectionalMagnitude;
    universalForce: DirectionalMagnitude;
    metersPerPixel: number // meters per pixel
}

export interface NearbyParticle {
    particle: IParticle;
    distance: Distance;
}

export type ForceMap = { [particleTargetId: string]: DirectionalMagnitude[] };

export class Environment {

    public readonly particles: Particle[] = [];
    private readonly particlesByShape: {[shapeId: string]: Particle} = {};
    public readonly properties: EnvironmentalProperties;

    private readonly forceLines: {[id: string]: ForceLine } = {};

    constructor(
        public readonly stage: Stage,
        properties: Partial<EnvironmentalProperties> = {},
    ) {
        this.properties = {
            coefficientOfFriction: 0.65,
            dimensions: {
                x: stage.canvas.width,
                y: stage.canvas.height,
            },
            metersPerPixel: (100000),
            universalForce: {x: 0, y: 0},
            ...properties,
        };
    }

    public getParticle(id: string): IParticle {
        return this.particlesByShape[id];
    }

    public createParticle(
        props: Partial<PhysicalProperties>,
        shape: Shape = this.stage.createShape(Circle).setRadius(10)
    ): Particle {
        const physicalProperties: PhysicalProperties = {
            mass: 10,
            initialVelocity: ZERO,
            initialAcceleration: ZERO,
            position: shape.position,
            ...props,
        };

        if (!equals(physicalProperties.position, shape.position)) {
            shape.setPosition(physicalProperties.position);
        }

        const particle = new Particle(this, physicalProperties, shape);
        this.particles.push(particle);
        this.particlesByShape[shape.id] = particle;
        return particle;
    }

    applyFriction = (acceleration: DirectionalMagnitude): DirectionalMagnitude => {

        const friction = this.properties.coefficientOfFriction;

        // noinspection JSSuspiciousNameCombination
        return {
            [Direction.x]: acceleration.x += (-1 * Math.sign(acceleration.x)) * friction,
            [Direction.y]: acceleration.y += (-1 * Math.sign(acceleration.y)) * friction,
        };
    };

    public pixelsToMeters(pixels: number){
        return this.properties.metersPerPixel*pixels;
    }

    public metersToPixels(meters: number){
        return 1/(this.properties.metersPerPixel/meters);
    }

    public getParticlesNearby(particle: Particle, withinRadius?: number): NearbyParticle[] {
        return this.getParticlesNear(particle.shape.position, withinRadius).filter(p => p.particle.id !== particle.id);
    }

    public getParticlesNear(position: DirectionalMagnitude, withinRadius?: number): NearbyParticle[] {
        return this.stage.getShapesNear(position, withinRadius)
            .map(shape => ({
                particle: this.particlesByShape[shape.shape.id],
                distance: shape.distance,
            }))
            .filter(nearby => Boolean(nearby.particle));
    }

    recalculateParticleForces(particle: Particle, forces: ForceMap = {}): { nearby: NearbyParticle[], forces: ForceMap } {

        const nearby = this.getParticlesNearby(particle);

        nearby.forEach(nearbyParticle => {
            const p = nearbyParticle.particle;
            if(!(p.id in forces)){
                forces[p.id] = [];
            }
            forces[p.id].push(Environment.gravitationalForceOn(particle, nearbyParticle));
        });

        return { nearby, forces };
    }


    private static gravitationalForceOn(particle: Particle, nearbyParticle: NearbyParticle) {

        const angleX = Math.asin(nearbyParticle.distance.x / nearbyParticle.distance.total);
        const angleY = Math.acos(nearbyParticle.distance.y / nearbyParticle.distance.total);

        const forceTotal = gravitationalForce(particle, nearbyParticle);

        // noinspection JSSuspiciousNameCombination
        return {
            x: Math.sin(angleX) * forceTotal,
            y: Math.cos(angleY) * forceTotal,
        };
    }

    private ensureForceLineExists = (particleA: Particle, particleB: NearbyParticle) => {
        const id = particleA.shape.id + '-' + particleB.particle.id;
        this.forceLines[id] = this.forceLines[id] || this.stage.createShape(ForceLine).setParticles(particleA, particleB);
    };
}