import {getTestStage} from "../testUtils";
import {Rectangle} from "../../src/shapes/Rectangle";
import {Color} from "../../src/color";

describe('Rectangle', () => {

    test('should fill to the right dimensions', () => {

        const { stage } = getTestStage();

        const rectangle = stage.createShape(Rectangle, {
            width: 50,
            height: 50,
            fill: new Color(255, 0, 0)
        });

        stage.draw();

        const top = rectangle.y;
        const bottom = rectangle.height + top;
        const left = rectangle.x;
        const right = rectangle.width + left;

        const topLeft = stage.context.getImageData(left, top, 1, 1).data[0];
        expect(topLeft).toEqual(255);

        const topRight = stage.context.getImageData(right-1, top, 1, 1).data[0];
        expect(topRight).toEqual(255);

        const bottomLeft = stage.context.getImageData(left, bottom-1, 1, 1).data[0];
        expect(bottomLeft).toEqual(255);

        const bottomRight = stage.context.getImageData(right-1, bottom-1, 1, 1).data[0];
        expect(bottomRight).toEqual(255);

        const middle = stage.context.getImageData(rectangle.width / 2, rectangle.height / 2, 1, 1).data[0];
        expect(middle).toEqual(255);

        const outside = stage.context.getImageData(right + 1, bottom + 1, 1, 1).data[0];
        expect(outside).toEqual(0);
    });

});