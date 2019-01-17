
export class Timer {

    private on: boolean = false;
    private timeStarted: Date | undefined;

    public get elapsed(): number {
        return this.timeStarted ?
            (new Date().getTime() - this.timeStarted.getTime()) :
            0;
    }

    public start(): Timer {
        if(this.on){
            throw new Error();
        }
        this.timeStarted = new Date();
        this.on = true;
        return this;
    }

    public stop(): Timer {
        this.on = false;
        this.timeStarted = undefined;
        return this;
    }
}
