
export interface Extrema {
    min: number;
    max: number;
    range: number;
}

export function getExtrema(numbers: number[]): Extrema {
    return numbers.reduce((result: Extrema, current: number) => {
            const minIsDefined = !Number.isNaN(result.min);
            const maxIsDefined = !Number.isNaN(result.max);

            if ((minIsDefined && current < result.min) || !minIsDefined) {
                result.min = current;
            }

            if ((maxIsDefined && current > result.max) || !minIsDefined) {
                result.max = current;
            }

            result.range = minIsDefined && maxIsDefined ? result.max - result.min : result.range;
            return result;
        },
        {min: Number.NaN, max: Number.NaN, range: 0}
    );
}

export function scale01(numbers: number[]): number[] {
    const extrema = getExtrema(numbers);
    return numbers.map(n => (n - extrema.min) / extrema.range);
}

export function multiply(a: number[], b: number[]): number[] {
    return a.map((numberA, index) => numberA * b[index]);
}

export function average(numbers: number[]): number {
    return numbers.reduce((result, num) => result + num, 0) / numbers.length;
}

export function weightedAverage(numbers: number[], weights: number[]): number {
    return average(
        multiply(numbers, weights)
    );
}
