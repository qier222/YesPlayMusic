# Contributing Guidelines

## Setup

To begin development fork repository and run `npm install` in its root folder.

## When you propose a new feature or bug fix

Please make sure there is an open issue discussing your contribution before jumping into a Pull Request!

There are just a few situations (listed below) in which it is fine to submit PR without a corresponding issue:

- Documentation update
- Obvious bug fix
- Maintenance improvement

In all other cases please check if there's an open an issue discussing the given proposal, if there is not, create an issue respecting all its template remarks.

In non-trivial cases please propose and let us review an implementation spec (in the corresponding issue) before jumping into implementation.

Do not submit draft PRs. Submit only finalized work which is ready for merge. If you have any doubts related to implementation work please discuss in the corresponding issue.

Once a PR has been reviewed and some changes are suggested, please ensure to **re-request review** after all new changes are pushed. It's the best and quietest way to inform maintainers that your work is ready to be checked again.

## When you want to work on an existing issue

**Note:** Please write a quick comment in the corresponding issue and ask if the feature is still relevant and that you want to jump into the implementation.

Check out our [help wanted](https://github.com/medikoo/es6-set/labels/help%20wanted) or [good first issue](https://github.com/medikoo/es6-set/labels/good%20first%20issue) labels to find issues we want to move forward with your help.

We will do our best to respond/review/merge your PR according to priority.

## Writing / improving documentation

Do you see a typo or other ways to improve it? Feel free to edit it and submit a Pull Request!

# Code Style

We aim for a clean, consistent code style. We're using [Prettier](https://prettier.io/) to confirm one code formatting style and [ESlint](https://eslint.org/) helps us to stay away from obvious issues that can be picked via static analysis.

Ideally, you should have Prettier and ESlint integrated into your code editor, which will help you not think about specific rules and be sure you submit the code that follows guidelines.

## Verifying prettier formatting

```
npm run prettier-check
```

## Verifying linting style

```
npm run lint
```

# Testing

This package needs to work in any ES5 environment, therefore it's good to confirm it passes tests in Node.js v0.12 release.

Run tests via:

```
npm test
```
