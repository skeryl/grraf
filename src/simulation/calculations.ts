import {GravitationalConstant} from "./constants";
import {IParticle, Particle} from "./Particle";
import {Direction, DirectionalMagnitude} from "./Simulation";
import {NearbyParticle} from "./Environment";

export type Distance = DirectionalMagnitude & {
    total: number
};

export function distanceBetween(particleA: IParticle, particleB: IParticle): Distance {
    const xDistance = particleA.position.x - particleB.position.x;
    const yDistance = particleA.position.x - particleB.position.y;
    return {
        [Direction.x]: xDistance,
        [Direction.y]: yDistance,
        total: Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2)),
    }
}

export function gravitationalForce(particleA: IParticle, particleB: NearbyParticle){
    return forceOfGravity(particleA.physicalProperties.mass, particleB.particle.physicalProperties.mass, particleA.environment.pixelsToMeters(particleB.distance.total));
}

export function gravitationalForceBetween(particleA: IParticle, particleB: IParticle){
    return gravitationalForce(particleA, {
        particle: particleB,
        distance: distanceBetween(particleA, particleB),
    });
}

export function forceOfGravity(massA: number, massB: number, distance: number): number {
    return ((massA*massB)/(Math.pow(distance, 2))) * GravitationalConstant;
}