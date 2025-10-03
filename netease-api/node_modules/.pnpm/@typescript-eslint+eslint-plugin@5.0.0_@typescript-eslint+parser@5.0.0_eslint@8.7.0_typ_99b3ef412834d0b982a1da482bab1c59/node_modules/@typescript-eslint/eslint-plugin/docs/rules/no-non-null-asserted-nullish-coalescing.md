# Disallows using a non-null assertion in the left operand of the nullish coalescing operator (`no-non-null-asserted-nullish-coalescing`)

## Rule Details

The nullish coalescing operator is designed to provide a default value when dealing with `null` or `undefined`.
Using non-null assertions in the left operand of the nullish coalescing operator is redundant.

Examples of **incorrect** code for this rule:

```ts
/* eslint @typescript-eslint/no-non-null-asserted-nullish-coalescing: "error" */

foo! ?? bar;
foo.bazz! ?? bar;
foo!.bazz! ?? bar;
foo()! ?? bar;

let x!: string;
x! ?? '';

let x: string;
x = foo();
x! ?? '';
```

Examples of **correct** code for this rule:

```ts
/* eslint @typescript-eslint/no-non-null-asserted-nullish-coalescing: "error" */

foo ?? bar;
foo ?? bar!;
foo!.bazz ?? bar;
foo!.bazz ?? bar!;
foo() ?? bar;

// This is considered correct code because because there's no way for the user to satisfy it.
let x: string;
x! ?? '';
```

## When Not To Use It

If you are not using TypeScript 3.7 (or greater), then you will not need to use this rule, as the nullish coalescing operator is not supported.

## Further Reading

- [TypeScript 3.7 Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html)
- [Nullish Coalescing Proposal](https://github.com/tc39/proposal-nullish-coalescing)
