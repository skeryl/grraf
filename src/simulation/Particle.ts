import {Shape} from "../shapes/Shape";
import {Circle} from "../shapes/Circle";
import {PhysicalProperties} from "./Simulation";
import {Environment} from "./Environment";
import {add, Direction, DirectionalMagnitude, ZERO} from "./DirectionalMagnitude";
import {Rectangle} from "../shapes/Rectangle";

export interface IParticle {

    readonly id: number;
    readonly environment: Environment;
    readonly physicalProperties: PhysicalProperties;
    readonly position: DirectionalMagnitude;
    readonly acceleration: DirectionalMagnitude;
    readonly velocity: DirectionalMagnitude;

    boundary(othersPosition: DirectionalMagnitude, position: DirectionalMagnitude, theta: number): DirectionalMagnitude;
}

export class Particle implements IParticle {

    readonly acceleration: DirectionalMagnitude;
    readonly velocity: DirectionalMagnitude;

    private readonly forcesToResolve: DirectionalMagnitude[] = [];

    constructor(
        public readonly environment: Environment,
        readonly physicalProperties: PhysicalProperties,
        public readonly shape: Shape = environment.stage.createShape(Circle).setRadius(10),
    ) {
        this.acceleration = {...physicalProperties.initialAcceleration};
        this.velocity = {...physicalProperties.initialVelocity};
    }

    addForce(force: DirectionalMagnitude): void {
        this.forcesToResolve.push(force);
    }

    boundary(othersPosition: DirectionalMagnitude, position: DirectionalMagnitude, theta: number): DirectionalMagnitude {
        if (this.shape instanceof Circle) {
            const circle = this.shape as Circle;
            const deltaX = circle.radius * Math.cos(theta);
            const deltaY = circle.radius * Math.sin(theta);
            return {
                x: position.x + deltaX,
                y: position.y + deltaY,
            };
        }

        if(this.shape instanceof Rectangle){
            const rect = this.shape as Rectangle;

            const rightBound = position.x + (rect.width);
            const leftBound = position.x;

            const leftOfRect = othersPosition.x < leftBound;
            const rightOfRect = othersPosition.x > rightBound;

            if(leftOfRect || rightOfRect){
                // coming from the side
                return {
                    x: leftOfRect ? position.x : (rightBound),
                    y: othersPosition.y,
                };
            } else {
                //coming from top or bottom
                const yDiff = (position.y - othersPosition.y);

                return {
                    x: (othersPosition.x + (yDiff/Math.tan(Math.PI - theta))),
                    y: (othersPosition.y < position.y) ? position.y : (position.y + rect.height),
                };
            }
        }

        throw new Error("Not implemented");
    }

    resolveForces(): DirectionalMagnitude {
        // sure... a "reduce" here would be super clean but then we'd also have to empty out the array :(
        let netForce = ZERO;
        while (this.forcesToResolve.length > 0) {
            const force = this.forcesToResolve.shift() as DirectionalMagnitude;
            netForce = add(netForce, force);
        }
        //this.applyForce(netForce);
        return netForce;
    }

    applyForce(forces: DirectionalMagnitude): void {
        this.acceleration.x = (forces[Direction.x] / this.physicalProperties.mass);
        this.acceleration.y = (forces[Direction.y] / this.physicalProperties.mass);
    }

    adjustVelocity(time: number) {
        this.velocity.x += (this.acceleration.x * time);
        this.velocity.y += (this.acceleration.y * time);
    }

    setAcceleration = (acceleration: DirectionalMagnitude) => {
        this.acceleration.x = acceleration.x;
        this.acceleration.y = acceleration.y;
    };

    public get combinedAcceleration(): number {
        // noinspection JSSuspiciousNameCombination
        return Math.sin(this.acceleration.y) + Math.cos(this.acceleration.x);
    }

    get id(): number {
        return this.shape.id;
    }

    get x(): number {
        return this.shape.x;
    }

    get y(): number {
        return this.shape.y;
    }

    get position(): DirectionalMagnitude {
        return this.shape.position;
    }

    setPosition(position: DirectionalMagnitude) {
        this.shape.setPosition(position);
    }
}