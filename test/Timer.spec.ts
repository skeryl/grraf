import {Timer} from "../src/Timer";

function waitFor(ms: number): Promise<void> {
    return new Promise<void>(resolve => {
        setTimeout(resolve, ms);
    });
}

describe("Timer", () => {

    test("should keep time", (done) => {
        const timer = new Timer();
        expect(timer.elapsed).toBe(0);

        timer.start();
        setTimeout(() => {
            timer.stop();
            expect(timer.elapsed - 20).toBeLessThanOrEqual(0.000000001); // <- just in case
            done();
        }, 20);
    });

    test("should stay stopped when stopped", async (done) => {
        const timer = new Timer();
        expect(timer.elapsed).toBe(0);
        await waitFor(20);
        expect(timer.elapsed).toBe(0);

        timer.start();
        await waitFor(20);

        timer.stop();
        expect(timer.elapsed - 20).toBeLessThanOrEqual(0.000000001); // <- allow for some error just in case

        await waitFor(20);
        // should be the same as 20ms ago since we're still stopped
        expect(timer.elapsed - 20).toBeLessThanOrEqual(0.000000001);
        done();
    });

});