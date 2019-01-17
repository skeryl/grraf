export enum Direction {
    x = "x",
    y = "y",
}

export const ZERO: DirectionalMagnitude = {x: 0, y: 0};

export type Vector = number[];
export type DirectionalMagnitude = { [dir in Direction]: number };

export function negative(value: DirectionalMagnitude) {
    return {
        x: -value.x,
        y: -value.y,
    };
}

export function add(magnitudeA: DirectionalMagnitude, magnitudeB: DirectionalMagnitude): DirectionalMagnitude {
    return {
        x: magnitudeA.x + magnitudeB.x,
        y: magnitudeA.y + magnitudeB.y
    };
}

export function subtract(magnitudeA: DirectionalMagnitude, magnitudeB: DirectionalMagnitude): DirectionalMagnitude {
    return {
        x: magnitudeA.x - magnitudeB.x,
        y: magnitudeA.y - magnitudeB.y
    };
}

export function equals(magnitudeA: DirectionalMagnitude, magnitudeB: DirectionalMagnitude): boolean {
    return magnitudeA.x === magnitudeB.x &&
        magnitudeA.y === magnitudeB.y;
}