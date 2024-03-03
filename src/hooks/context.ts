import type { Engine } from "../engine";

//!EXPERIMENTAL, NOT YET WORKING (THIS IS A STUPID IDEA)

const dispatcher: { current: any | null } = {
    current: null
}

function resolveDispatcher() {
    return dispatcher.current;
}

export function setEngine(engine: Engine) {
    dispatcher.current = engine;
}

export function useEngine() {
    return resolveDispatcher() as Engine;
}

export function useFork() {
    const engine = useEngine();

    return engine.fork();
}