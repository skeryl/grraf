import {getExtrema, scale01} from "../../src/utils/data";

describe('data', () => {
    describe('getExtrema', () => {

        test('should return base values for empty data', () => {
            expect(getExtrema([])).toEqual({
                min: Number.NaN,
                max: Number.NaN,
                range: 0,
            })
        });

        test('should return appropriate extrema (basic)', () => {
            const numbers = [
                0, 10, 15, 150
            ];
            expect(getExtrema(numbers)).toEqual({
                min: 0,
                max: 150,
                range: 150,
            });
        });

        test('should return appropriate extrema (some negative)', () => {
            const numbers = [
                -27, 0, 10, 15, 150
            ];
            expect(getExtrema(numbers)).toEqual({
                min: -27,
                max: 150,
                range: 177,
            });
        });

        test('should return appropriate extrema (all negative)', () => {
            const numbers = [
                -27, -12, -10, -3
            ];
            expect(getExtrema(numbers)).toEqual({
                min: -27,
                max: -3,
                range: 24,
            });
        });

        test('should return appropriate extrema (all 0)', () => {
            const numbers = [
                0, 0, 0, 0
            ];
            expect(getExtrema(numbers)).toEqual({
                min: 0,
                max: 0,
                range: 0,
            });
        });

    });

    describe('scale01', () => {
        test('should scale to 0-1 appropriately (min is 0)', () => {
            expect(scale01([0, 5, 15, 20]))
                .toEqual([ 0, 0.25, 0.75, 1 ]);
        });
        test('should scale to 0-1 appropriately (non-zero min)', () => {
            expect(scale01([-20, 5, 15, 20]))
                .toEqual([ 0, 0.625, 0.875, 1 ]);
        });
        test('should scale to 0-1 appropriately (all zeros and ones)', () => {
            expect(scale01([0, 0, 1, 1]))
                .toEqual([ 0, 0, 1, 1 ]);
        });
        test('should scale to 0-1 appropriately (already scaled)', () => {
            expect(scale01([ 0, 0.25, 0.75, 1] ))
                .toEqual([ 0, 0.25, 0.75, 1 ]);
        });
    });
});
