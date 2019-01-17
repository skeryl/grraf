import {Stage} from "../src/Stage";
import {Rectangle} from "../src/shapes/Rectangle";
import {getTestStage} from "./testUtils";

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

});