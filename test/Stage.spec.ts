import {Stage} from "../src/Stage";
import {Rectangle} from "../src/shapes/Rectangle";
import {getTestStage} from "./testUtils";
import {Color} from "../src/color";

describe("Stage", function () {

    test("should create a canvas on initialization when attached to a container", () => {

        const {container, stage} = getTestStage();

        // canvas now exists
        const foundCanvas = container.querySelector("canvas");
        // should be the same canvas that is attached to the Stage
        expect(stage.canvas).toBe(foundCanvas);

        // creating another stage on the same container should re-use that same canvas
        const anotherStage = new Stage(container);
        expect(anotherStage.canvas).toBe(foundCanvas);
    });

    test("createShape should create a shape that should be returned from getShape", () => {
        const { stage } = getTestStage();

        const rectangle: Rectangle = stage.createShape(Rectangle);

        expect(rectangle).toBeDefined();

        expect(rectangle.x).toBe(0);
        expect(rectangle.y).toBe(0);

        const rectById = stage.getShape(rectangle.id);
        expect(rectangle).toBe(rectById);
    });

    // ToDo: fix this
    describe('createOffscreen', () => {
        test(`should create a Stage which doesn't inherently draw to the main canvas.`, () => {
            const { stage, container } = getTestStage();

            const offscreenStage = Stage.createOffscreen(undefined, false, container.ownerDocument as Document);

            offscreenStage.createShape(Rectangle, {
                width: 10, height: 10,
                strokeStyle: Color.transparent,
                fill: Color.black,
                position: { x: 0, y: 0 }
            });

            const redValue = stage.context.getImageData(2, 2, 1, 1).data[0];
            expect(redValue).toBe(0);

            stage.drawStage(offscreenStage);
            stage.draw();

            const imageData = stage.context.getImageData(2, 2, 1, 1).data;
            const redValueAfter = imageData[0];
            expect(redValueAfter).toBe(255);
        });
    });

});