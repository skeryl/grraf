import {getTestStage} from "../testUtils";
import {Circle} from "../../src/shapes/Circle";
import {Color} from "../../src/color";

describe('Circle', () => {

    test('should fill to the right dimensions', () => {

        const { stage } = getTestStage();

        const circle = stage.createShape(Circle, {
            radius: 5,
            position: {
                x: 10, y: 10,
            },
            fill: new Color(255, 0, 0)
        });

        stage.draw();

        // walk on the inside- everything should be filled
        const steps = 100;
        for(let i = 0; i <= steps; i++){
            const radians = Math.PI*2*(i/steps);
            const x = circle.x + ((circle.radius-1) * Math.cos(radians));
            const y = circle.y + ((circle.radius-1) * Math.sin(radians));

            const pointInCircle = stage.context.getImageData(x, y, 1, 1).data[0];
            expect(pointInCircle).toEqual(255);
        }

        // walk the circle on the outside- everything should be not filled
        for(let i = 0; i <= 100; i++){
            const radians = Math.PI*2*(i/steps);
            const x = circle.x + ((circle.radius) * Math.cos(radians) * 2);
            const y = circle.y + ((circle.radius) * Math.sin(radians) * 2);

            const pointOutOfCircle = stage.context.getImageData(x, y, 1, 1).data[0];
            expect(pointOutOfCircle).toEqual(0);
        }
    });

});