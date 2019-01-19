import {ScalingMap} from "../../src/simulation/ScalingMap";

describe('ScalingMap', function () {

    describe('has', function() {

        test('should verify that a key exists when it does', () => {
            const map = new ScalingMap<string, string>();
            map.set('test', 'value');
            expect(map.has('test')).toBeTruthy();
        });

        test(`should verify that a key doesn't exists when it doesn't`, () => {
            const map = new ScalingMap<string, string>();
            expect(map.has('test')).toBeFalsy();
        });
    });

    describe('get', function () {

        test('should return a stored value', () => {
            const map = new ScalingMap<string, string>();
            map.set('test', 'value');
            expect(map.get('test')).toEqual('value');
        });

        test('should return undefined for a missing value', () => {
            const map = new ScalingMap<string, string>();
            expect(map.get('test')).toBeUndefined();
        });

        test('should not delete elements', () => {
            const map = new ScalingMap<string, string>(2);
            expect(map.size).toBe(0);
            map.set('test', 'value');
            expect(map.size).toBe(1);
            expect(map.get('test')).toEqual('value');
            expect(map.size).toBe(1);
        });
    });

    describe('set', function () {

        test('should delete extra elements from the beginning when the maximum size is exceeded', () => {
            const map = new ScalingMap<string, string>(2);
            expect(map.size).toBe(0);

            map.set('test', 'value');
            expect(map.size).toBe(1);
            map.set('test2', 'value2');
            expect(map.size).toBe(2);
            map.set('test3', 'value3');
            expect(map.size).toBe(2);

            expect(Array.from(map.keys())).toEqual([
                'test2', 'test3'
            ]);
        });

        test('should not delete elements when an existing key is modified', () => {
            const map = new ScalingMap<string, string>(2);
            expect(map.size).toBe(0);

            map.set('test', 'value');
            expect(map.size).toBe(1);
            map.set('test2', 'value2');
            expect(map.size).toBe(2);
            map.set('test2', 'value3');
            expect(map.size).toBe(2);

            expect(map.get('test2')).toEqual('value3');

            expect(Array.from(map.keys())).toEqual([
                'test', 'test2'
            ]);
        });

    });
});