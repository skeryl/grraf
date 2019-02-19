import {getTestStage} from "../testUtils";
import {Path} from "../../src/shapes/Path";
import {Color} from "../../src/color";

describe("Path", () => {
    test('a closed path should be filled with a fill style', () => {

        const { stage } = getTestStage();

        const path = stage.createShape(Path)
            .moveTo(0, 0)
            .lineTo(100, 100)
            .lineTo(0, 100)
            .closePath()
            .setColor(new Color(255, 0, 0));

        stage.draw();

        const ctx = stage.canvas.getContext('2d') as CanvasRenderingContext2D;
        const pixel = ctx.getImageData(5, 15, 1, 1).data[0];
        expect(pixel).toEqual(255);
    });
});