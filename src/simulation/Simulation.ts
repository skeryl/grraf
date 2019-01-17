import {Timer} from "../Timer";
import {Environment, NearbyParticle} from "./Environment";
import {SimulationBuffer} from "./SimulationCalculator";
import {DirectionalMagnitude} from "./DirectionalMagnitude";

export interface PhysicalProperties {
    mass: number;
    position: DirectionalMagnitude;
    initialAcceleration: DirectionalMagnitude;
    initialVelocity: DirectionalMagnitude
    coefficientOfFriction?: number;
}

export type TickHandler = (timeSeconds: number, environment: Environment) => void;

export type NearbyParticleMap = {
    [particleId: number]: NearbyParticle;
};

export type ParticleMatrix = {
    [particleId: number]: NearbyParticleMap;
};

export class Simulation {

    // determines how "fast" a simulation runs
    // 2 is double-time, 1 is real-time, 0.5 is half-time, etc
    private speed: number = 1;

    private _timeMilliseconds: number = 0;
    private _lastTick: number = 0;

    private running: boolean = false;
    private timer: Timer = new Timer();
    private tickHandler: TickHandler = () => {};

    private readonly calculations = new SimulationBuffer(this.environment);

    constructor(
        public readonly environment: Environment
    ){
    }

    public time = (): number => {
        return this._timeMilliseconds - this._lastTick;
    };

    public secondsFromLastTick = () => {
        return (this.time()/1000)*this.speed;
    };

    private tick = (): void => {
        if(this.running){
            this._timeMilliseconds = this.timer.elapsed;

            const stepResult = this.calculations.calculate(this.secondsFromLastTick());

            Object.keys(stepResult).forEach(particleId => {

                const particleStep = stepResult[particleId];

                const particle = this.environment.getParticle(particleId);
                particle.setPosition(particleStep.position);
            });

            this.environment.stage.draw();
            this.tickHandler(this._timeMilliseconds*this.speed, this.environment);
            this._lastTick = this.timer.elapsed;
            requestAnimationFrame(this.tick);
        }
    };

    public onTick = (handler: TickHandler) => {
      this.tickHandler = handler;
    };

    public start = (): void => {
        this.running = true;
        this.timer.start();
        this.tick();
    };

    public stop = (): void => {
        this.running = false;
        this.timer.stop();
    };

    public setSpeed(speed: number){
        if(speed <= 0){
            throw new Error("Why bother? T'would be a boring simulation indeed.");
        }
        if(speed >= 5_000_000){
            throw new Error("Yikes...");
        }
        this.speed = speed;
    }

}