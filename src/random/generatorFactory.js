import * as seedrandom from 'seedrandom';

export function newDefaultGenerator(seed = Math.random()) {
    const generator = new seedrandom.xor4096(seed);

    return () => generator();
}
