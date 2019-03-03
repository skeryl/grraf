import {Color} from "../../src/color";

const half = Math.floor(255/2);
const quarter = Math.floor(half/2);

describe('Color', () => {

    describe('mix', () => {

        test('should mix colors (simple/unweighted)', () => {
            const red = new Color(255, 0, 0);
            const blue = new Color(0, 0, 255);
            const purple = Color.mix([red, blue]);

            expect(purple.red()).toEqual(half);
            expect(purple.green()).toEqual(0);
            expect(purple.blue()).toEqual(half);
        });

        test('should mix colors (simple weighted)', () => {
            const red = new Color(255, 0, 0);
            const blue = new Color(0, 0, 255);
            const purple = Color.mix([red, blue], [0.5, 1]);

            expect(purple.red()).toEqual(quarter);
            expect(purple.green()).toEqual(0);
            expect(purple.blue()).toEqual(half);
        });

    });

});