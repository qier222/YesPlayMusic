# Avoid using promises in places not designed to handle them (`no-misused-promises`)

This rule forbids using promises in places where the TypeScript compiler
allows them but they are not handled properly. These situations can often arise
due to a missing `await` keyword or just a misunderstanding of the way async
functions are handled/awaited.

## Rule Details

Examples of **incorrect** code for this rule with `checksConditionals: true`:

```ts
const promise = Promise.resolve('value');

if (promise) {
  // Do something
}

const val = promise ? 123 : 456;

while (promise) {
  // Do something
}
```

Examples of **correct** code with `checksConditionals: true`:

```ts
const promise = Promise.resolve('value');

// Always `await` the Promise in a conditional
if (await promise) {
  // Do something
}

const val = (await promise) ? 123 : 456;

while (await promise) {
  // Do something
}
```

---

Examples of **incorrect** code for this rule with `checksVoidReturn: true`:

```ts
[1, 2, 3].forEach(async value => {
  await doSomething(value);
});

new Promise(async (resolve, reject) => {
  await doSomething();
  resolve();
});

const eventEmitter = new EventEmitter();
eventEmitter.on('some-event', async () => {
  synchronousCall();
  await doSomething();
  otherSynchronousCall();
});
```

Examples of **correct** code with `checksVoidReturn: true`:

```ts
// for-of puts `await` in outer context
for (const value of [1, 2, 3]) {
  await doSomething(value);
}

// If outer context is not `async`, handle error explicitly
Promise.all(
  [1, 2, 3].map(async value => {
    await doSomething(value);
  }),
).catch(handleError);

// Use an async IIFE wrapper
new Promise((resolve, reject) => {
  // combine with `void` keyword to tell `no-floating-promises` rule to ignore unhandled rejection
  void (async () => {
    await doSomething();
    resolve();
  })();
});

// Name the async wrapper to call it later
const eventEmitter = new EventEmitter();
eventEmitter.on('some-event', () => {
  const handler = async () => {
    await doSomething();
    otherSynchronousCall();
  };

  try {
    synchronousCall();
  } catch (err) {
    handleSpecificError(err);
  }

  handler().catch(handleError);
});
```

## Options

This rule accepts a single option which is an object with `checksConditionals`
and `checksVoidReturn` properties indicating which types of misuse to flag.
Both are enabled by default

If you don't want functions that return promises where a void return is
expected to be checked, your configuration will look like this:

```json
{
  "@typescript-eslint/no-misused-promises": [
    "error",
    {
      "checksVoidReturn": false
    }
  ]
}
```

Likewise, if you don't want to check conditionals, you can configure the rule
like this:

```json
{
  "@typescript-eslint/no-misused-promises": [
    "error",
    {
      "checksConditionals": false
    }
  ]
}
```

## When Not To Use It

If you do not use Promises in your codebase or are not concerned with possible
misuses of them outside of what the TypeScript compiler will check.

## Related to

- [`no-floating-promises`](./no-floating-promises.md)

## Further Reading

- [TypeScript void function assignability](https://github.com/Microsoft/TypeScript/wiki/FAQ#why-are-functions-returning-non-void-assignable-to-function-returning-void)
