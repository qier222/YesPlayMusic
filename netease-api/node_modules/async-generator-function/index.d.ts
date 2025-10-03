import type { AsyncFunction, AsyncFunctionConstructor } from 'async-function';

type AGF = AsyncGeneratorFunction;

declare namespace getAsyncGeneratorFunction {
    interface AsyncGeneratorFunction extends AGF, AsyncFunction {
        readonly [Symbol.toStringTag]: "AsyncGeneratorFunction";
    }
    
    // The constructor for an async generator function, like `(async function*(){}).constructor`
    interface AsyncGeneratorFunctionConstructor {
        (...args: string[]): AsyncGeneratorFunction;
        new (...args: string[]): AsyncGeneratorFunction;
        readonly prototype: AsyncGeneratorFunction;
    }

    export type { AsyncGeneratorFunctionConstructor };
}

declare function getAsyncGeneratorFunction(): getAsyncGeneratorFunction.AsyncGeneratorFunctionConstructor | false;

export = getAsyncGeneratorFunction;