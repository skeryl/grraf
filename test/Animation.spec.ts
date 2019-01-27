import {getTestStage} from "./testUtils";
import {Circle} from "../src/shapes/Circle";

describe('Animation', () => {

    beforeAll(() => {
        (window as any).requestAnimationFrame = (cb: () => void) => {
            return setImmediate(cb);
        };
    });

    describe('number animation', () => {

        test('should transition from one number to another', (done) => {
            const { stage } = getTestStage();

            const circle = stage.createShape(Circle)
                .setRadius(10);

            const animation = stage.animate(circle)
                .transition('radius', {
                    0: 10,
                    500: 20,
                }).create();

            expect(circle.radius).toBe(10);

            animation.start();

            setTimeout(() => {
                expect(circle.radius - 15).toBeLessThanOrEqual(0.5);
            }, 250);

            animation.then(() => {
                expect(circle.radius).toBe(20);
                done();
            });
        });

    });

    describe('position animation', () => {

        test('should move position from one coordinate to another', (done) => {
            const { stage } = getTestStage();

            const circle = stage.createShape(Circle)
                .setPosition({ x: 0, y: 0 });

            const animation = stage.animate(circle)
                .transition('position', {
                    0: { x: 0, y: 0 },
                    500: { x: 10, y: 10 },
                }).create();

            expect(circle.position).toEqual({ x: 0, y: 0 });

            animation.start();

            setTimeout(() => {
                expect(circle.position.x - 5).toBeLessThanOrEqual(0.5);
            }, 250);

            animation.then(() => {
                expect(circle.position).toEqual({ x: 10, y: 10 });
                done();
            });
        });

    });
});