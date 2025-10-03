"use strict";

let i = 0;
const context = [];
exports.describe = (description, fn) => {
  context.push(description);
  fn();
  context.pop(description);
  if (context.length === 0) {
    process.stdout.write('\n');
    console.log(`${i} tests run`);
  }
};

exports.it = (description, fn) => {
  if (++i % 1000 === 0) {
    process.stdout.write('·');
  }

  try {
    fn();
  } catch (e) {
    context.push(description);

    let string = '\n';
    for (let i = 0; i < context.length; i++) {
      string += `${'\t'.repeat(i)}${context[i]}\n`;
    }
    console.error(string);
    console.error(e.stack);
    process.exit(1);
  }
};
