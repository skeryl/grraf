import {Color} from "./Color";
import {Shape} from "./shapes/Shape";
import {Stage} from "./Stage";

const noOp = (() => {});

interface AnimationTransition<T, K extends keyof T> {
    shape: T;
    key: K;
    startTimeMillis: number;
    endTimeMillis: number;
    startValue: T[K];
    endValue: T[K];
    timingFunction: TimingFunction;
}

export interface AnimationParams {
    runTime: number;
    repeat: boolean;
}

type PropertyTransitionFrames<Value> = {
    [millis: number]: Value
};

function numerically(a: number, b: number){
    return Math.sign(a-b);
}

export class AnimationBuilder<T> {

    public readonly transitions: AnimationTransition<T, any>[] = [];

    constructor(
        private readonly stage: Stage,
        private readonly shape: T
    ) {
    }

    transition<K extends keyof T>(key: K, transitions: PropertyTransitionFrames<T[K]>, timingFunction: TimingFunction = TimingFunction.Linear): AnimationBuilder<T> {

        type KeyFrame = { time: number, value: T[K] };

        Object.keys(transitions).map(parseFloat).sort(numerically).reduce((lastFrame: KeyFrame | null, transitionTime:number) => {
            const keyFrame = { time: transitionTime, value: transitions[transitionTime] };

            if(lastFrame){
                this.transitions.push({
                    shape: this.shape,
                    key,
                    timingFunction,
                    startTimeMillis: lastFrame.time,
                    endTimeMillis: keyFrame.time,
                    startValue: lastFrame.value,
                    endValue: keyFrame.value,
                })
            }
            return keyFrame;
        }, null);

        return this;
    }

    _addTransition<K extends keyof T>(item: T, key: K, start: T[K], end: T[K], timingFunction: TimingFunction) {

        return this;
    }

    public create(params?: Partial<AnimationParams>): Animation {
        return new Animation(this.stage, params || {}, this.transitions);
    }
}

export enum TimingFunction {
    Linear = 'Linear',
    EaseInOutCubic = 'EaseInOutCubic',
    EaseInCubic = 'EaseInCubic',
    EaseOutCubic = 'EaseOutCubic',
    Squared = 'Squared',
}

type EaseFunc = (x: number) => number;

export class Animation {

    /**
     * Easing Functions
     **/
    public static Easing: {[key in TimingFunction]: EaseFunc } = {
        [TimingFunction.Linear]: (x: number) => x,
        [TimingFunction.EaseInOutCubic]: (x: number) => x < 0.5 ? Math.pow(x, 3) * 4 : (x - 1) * Math.pow(((2 * x) - 2), 2) + 1, // <-  inspired by http://gizma.com/easing/
        [TimingFunction.EaseInCubic]: (x: number) => x < 0.5 ? x : (x - 1) * Math.pow(((2 * x) - 2), 2) + 1,
        [TimingFunction.EaseOutCubic]: (x: number) => x < 0.5 ? Math.pow(x, 3) * 4 : x,
        [TimingFunction.Squared]: (x: number) => { return x**2; }
    };

    constructor(
        private readonly stage: Stage,
        private readonly params: Partial<AnimationParams>,
        private readonly transitions: AnimationTransition<any, any>[]
    ) {

    }

    private cancelled: boolean = false;
    private startTime: number | null = null;
    private resolve: () => void = noOp;
    private whenComplete = new Promise<void>(resolve => {
        this.resolve = resolve;
    });

    public start = () => {
        if (!this.startTime) {
            this.startTime = new Date().getTime();
            this.nextFrame();
        }
    };

    private nextFrame = () => {
        if (this.cancelled) {
            this.resolve();
            return;
        }

        const currentDurationInMillis = () => new Date().getTime() - (this.startTime || 0);

        const isFinished = this.transitions.map((transition: AnimationTransition<any, any>) => {
            if(currentDurationInMillis() > transition.endTimeMillis){
                return true;
            }
            if(currentDurationInMillis() >= transition.startTimeMillis){

                const duration = transition.endTimeMillis - transition.startTimeMillis;
                const pctComplete = (currentDurationInMillis() - transition.startTimeMillis) / duration;

                this.tickTransition(transition, pctComplete);
                return pctComplete >= 1;
            }
            return false;
        }).reduce((result: boolean, itemIsFinished: boolean) => result && itemIsFinished, true);

        this.stage.draw();

        if(isFinished){
            this.complete();
        } else {
            window.requestAnimationFrame(this.nextFrame);
        }
    };

    private complete() {
        this.startTime = null;
        this.resolve();
        if(this.params.repeat){
            this.start();
        }
    }

    public cancel = () => {
        this.cancelled = true;
    };

    public then = (toRun: () => void) => {
        return this.whenComplete.then(() => {
            if(!this.cancelled){
                toRun();
            }
        });
    };

    private tickTransition = <T extends Shape, K extends keyof T>(transition: AnimationTransition<T, K>, pctComplete: number) => {
        const ease: EaseFunc = Animation.Easing[transition.timingFunction];
        const percent = ease(pctComplete);
        transition.shape[transition.key] = Animation.getIntermediateValue(transition.startValue, transition.endValue, percent);
        this.stage.draw();
    };

    private static getIntermediateValue<T, K extends keyof T>(startValue: T[K], endValue: T[K], percent: number): T[K] {
        if(startValue instanceof Color){
            return Color.combineColors(<Color>startValue, <Color><any>endValue, percent, false) as any as T[K];
        }
        const type = (typeof startValue);
        if(type === "string"){
            throw new Error("Unable to combine strings.");
        }
        if(type === "number"){
            const start = <number><any>startValue;
            const end = <number><any>endValue;

            const total = (end - start);
            return start + (percent * total) as any as T[K];
        }
        throw new Error(`Unable to combine values of type '${type}.'`);
    }
}