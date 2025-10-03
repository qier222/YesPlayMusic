'use strict';

var acorn = require('acorn');
require('../')(acorn);
var estraverse = require('estraverse');
var xtend = require('xtend');
var assert = require('assert');

function find (type, ast, skip) {
  skip = skip || 0;
  var skipped = 0;

  var found;

  estraverse.traverse(ast, {
    enter: (node) => {
      if (found) {
        return estraverse.VisitorOption.Skip;
      }
      if (node.type == type) {
        if (skipped === skip) {
          found = node;
          return estraverse.VisitorOption.Skip;
        }
        skipped++;
      }
    }
  });

  if (!found) {
    throw new Error('did not find AwaitExpression (skipped ' + skipped + '/' + skip + ')');
  }

  return found;
}

function extendOptions(pluginOptions, acornOptions) {
  return xtend({
    sourceType: 'module',
    ecmaVersion: 8,
    locations: true,
    ranges: true,
    plugins: {asyncawait: pluginOptions || pluginOptions !== false}
  }, acornOptions);
}

function parse(code, pluginOptions, acornOptions) {
  if (Array.isArray(code)) {
    code = code.join('\n');
  }
  var options = extendOptions(pluginOptions, acornOptions);
  return acorn.parse(code, options);
}

describe('async', () => {
  describe ('function declaration', () => {
    var node;

    describe('-', () => {
      beforeEach(() => {
        node = find(
          'FunctionDeclaration',
          parse([
            'async function foo() {',
            '  x = await bar()',
            '}'
          ])
        );
      });

      it('marks the node as async', () =>
        assert(node.async)
      );

      it('finds correct start position', () =>
        assert.strictEqual(node.start, 0)
      );

      it('finds correct end position', () =>
        assert.strictEqual(node.end, 42)
      );

      it('finds correct start line/column', () =>
        assert.deepEqual(node.loc.start, {
          line: 1,
          column: 0
        })
      );

      it('finds correct end line/column', () =>
        assert.deepEqual(node.loc.end, {
          line: 3,
          column: 1
        })
      );
    });

    var assertFindsIdentifierExpressionStatement = (ast) => {
      node = find('ExpressionStatement', ast);
      assert.strictEqual(node.expression.type, 'Identifier');
      assert.strictEqual(node.expression.name, 'async');
      assert.deepEqual(node.expression.loc, {
        start: {
          line: 1,
          column: 0
        },
        end: {
          line: 1,
          column: 5
        }
      });
    };

    describe('linefeed after async (simple)', () => {
      var ast;
      beforeEach(() => {
        ast = parse([
          'async \t\t  ',
          'function foo() {',
          '}'
        ]);
      });

      it('finds Identifier ExpressionStatement', () => {
        assertFindsIdentifierExpressionStatement(ast);
      });

      it('does not mark FunctionDeclaration as async', () => {
        node = find('FunctionDeclaration', ast);
        assert(!node.async, 'Expected node.async to be false');
      });
    });

    describe('linefeed after async (single line comment)', () => {
      var ast;
      beforeEach(() => {
        ast = parse([
          'async // flag enables async completion',
          'function foo() {',
          '}'
        ]);
      });

      it('finds Identifier ExpressionStatement', () => {
        assertFindsIdentifierExpressionStatement(ast);
      });

      it('does not mark FunctionDeclaration as async', () => {
        node = find('FunctionDeclaration', ast);
        assert(!node.async, 'Expected node.async to be false');
      });
    });

    describe('linefeed after async (multiline comment) function', () => {
      var ast;
      beforeEach(() => {
        ast = parse([
          'async /* flag enables async completion',
          '         of the callback */function foo() {',
          '}'
        ]);
      });

      it('finds Identifier ExpressionStatement', () => {
        assertFindsIdentifierExpressionStatement(ast);
      });

      it('does not mark FunctionDeclaration as async', () => {
        node = find('FunctionDeclaration', ast);
        assert(!node.async, 'Expected node.async to be false');
      });
    });
  });

  describe ('function expression', () => {
    var node, code;

    describe('-', () => {
      beforeEach(() => {
        code = [
          'foo = async function () {',
          '  x = await bar()',
          '}'
        ];
        node = find(
          'FunctionExpression',
          parse(code)
        );
      });

      it('marks the node as async', () =>
        assert(node.async)
      );

      it('finds correct start position', () =>
        assert.strictEqual(node.start, 6)
      );

      it('finds correct end position', () =>
        assert.strictEqual(node.end, code.join('\n').length)
      );

      it('finds correct start line/column', () =>
        assert.deepEqual(node.loc.start, {
          line: 1,
          column: 6
        })
      );

      it('finds correct end line/column', () =>
        assert.deepEqual(node.loc.end, {
          line: 3,
          column: 1
        })
      );
    });

    var assertFindsIdentifierAssignmentExpressionRHS = (ast) => {
      node = find('AssignmentExpression', ast);
      assert.strictEqual(node.right.type, 'Identifier');
      assert.strictEqual(node.right.name, 'async');
      assert.deepEqual(node.right.loc, {
        start: {
          line: 1,
          column: 6
        },
        end: {
          line: 1,
          column: 11
        }
      });
    };

    describe('linefeed after async (simple)', () => {
      var ast;
      beforeEach(() => {
        ast = parse([
          'foo = async \t\t  ',
          ', function() {',
          '}'
        ]);
      });

      it('finds Identifier ExpressionStatement', () => {
        assertFindsIdentifierAssignmentExpressionRHS(ast);
      });

      it('does not mark FunctionExpression as async', () => {
        node = find('FunctionExpression', ast);
        assert(!node.async, 'Expected node.async to be false');
      });
    });

    describe('linefeed after async (single line comment)', () => {
      var ast;
      beforeEach(() => {
        ast = parse([
          'foo = async // flag enables async completion',
          ', function() {',
          '}'
        ]);
      });

      it('finds Identifier ExpressionStatement', () => {
        assertFindsIdentifierAssignmentExpressionRHS(ast);
      });

      it('does not mark FunctionExpression as async', () => {
        node = find('FunctionExpression', ast);
        assert(!node.async, 'Expected node.async to be false');
      });
    });

    describe('linefeed after async (multiline comment), function', () => {
      var ast;
      beforeEach(() => {
        ast = parse([
          'foo = async /* flag enables async completion',
          '         of the callback */, function() {',
          '}'
        ]);
      });

      it('finds Identifier ExpressionStatement', () => {
        assertFindsIdentifierAssignmentExpressionRHS(ast);
      });

      it('does not mark FunctionExpression as async', () => {
        node = find('FunctionExpression', ast);
        assert(!node.async, 'Expected node.async to be false');
      });
    });
  });

  describe ('enhanced object literal', () => {
    var node, code;

    describe('-', () => {
      beforeEach(() => {
        code = [
          'var x = {',
          '  async foo() {}',
          '};'
        ];
        node = find(
          // TODO: Is it really supposed to mark the Property async? Why not the FunctionExpression?
          'Property',
          parse(code)
        );
      });

      it('marks the node value as async', () =>
          assert(node.value.async)
      );

      it('does not mark the node as async', () =>
          assert(!node.async)
      );

      it('finds correct start position', () =>
          assert.strictEqual(node.start, 12)
      );

      it('finds correct end position', () =>
          assert.strictEqual(node.end, code[0].length + code[1].length + 1) // + 1 is due to newline char
      );

      it('finds correct start line/column', () =>
          assert.deepEqual(node.loc.start, {
            line: 2,
            column: 2
          })
      );

      it('finds correct end line/column', () =>
          assert.deepEqual(node.loc.end, {
            line: 2,
            column: 16
          })
      );
    });

    describe('linefeed after async (simple)', () => {
      it('fails to parse', () => {
        assert.throws(() => parse([
          'var x = {',
          '  async \t\t  ',
          '  foo() {}',
          '};'
        ]));
      });
    });

    describe('linefeed after async (single line comment)', () => {
      it('fails to parse', () => {
        assert.throws(() => parse([
          'var x = {',
          '  async // flag enables async completion',
          '  foo() {}',
          '};'
        ]));
      });
    });

    describe('linefeed after async (multiline comment) illegal decl', () => {
      it('finds Identifier ExpressionStatement', () => {
        assert.throws(() => parse([
          'var x = {',
          '  async /* flag enables async completion',
          '         of the callback */ foo() {}',
          '};'
        ]));
      });
    });
  });

  describe ('ArrowFunctionExpression', () => {
    var node, code;

    describe('-', () => {
      beforeEach(() => {
        code = 'var x = async () => {}';
        node = find(
          'ArrowFunctionExpression',
          parse(code)
        );
      });

      it('marks the node as async', () =>
          assert(node.async)
      );

      it('finds correct start position', () =>
          assert.strictEqual(node.start, 8)
      );

      it('finds correct end position', () =>
          assert.strictEqual(node.end, code.length)
      );

      it('finds correct start line/column', () =>
          assert.deepEqual(node.loc.start, {
            line: 1,
            column: 8
          })
      );

      it('finds correct end line/column', () =>
          assert.deepEqual(node.loc.end, {
            line: 1,
            column: code.length
          })
      );
    });

    describe('linefeed after async (simple)', () => {
      var ast;
      beforeEach(() => {
        ast = parse([
          'var x = async \t\t  ',
          '()'
        ]);
      });

      it('fails to parse if linefeed preceeds arrow arguments', () => {
        assert.throws(() => parse([
          'var x = async \t\t  ',
          '() => {}'
        ]));
      });

      it('finds CallExpression with "async" Identifier callee', () => {
        node = find('CallExpression', ast);
        assert.strictEqual(node.callee.type, 'Identifier');
        assert.strictEqual(node.callee.name, 'async');
        assert.deepEqual(node.callee.loc, {
          start: {
            line: 1,
            column: 8
          },
          end: {
            line: 1,
            column: 13
          }
        });
      });
    });

    describe('linefeed after async (single line comment)', () => {
      var ast;
      beforeEach(() => {
        ast = parse([
          'var x = async // flag enables async completion',
          '()'
        ]);
      });

      it('fails to parse if linefeed preceeds arrow arguments', () => {
        assert.throws(() => parse([
          'var x = async \t\t  ',
          '() => {}'
        ]));
      });

      it('finds CallExpression with "async" Identifier callee', () => {
        node = find('CallExpression', ast);
        assert.strictEqual(node.callee.type, 'Identifier');
        assert.strictEqual(node.callee.name, 'async');
        assert.deepEqual(node.callee.loc, {
          start: {
            line: 1,
            column: 8
          },
          end: {
            line: 1,
            column: 13
          }
        });
      });
    });

    describe('linefeed after async (multiline comment) arrow decl', () => {
      var ast;
      beforeEach(() => {
        ast = parse([
          'var x = async /* flag enables async completion',
          '         of the callback */()'
        ]);
      });

      it('fails to parse if linefeed preceeds arrow arguments', () => {
        assert.throws(() => parse([
          'var x = async /* flag enables async completion',
          '         of the callback */() => {}'
        ]));
      });

      it('finds CallExpression with "async" Identifier callee', () => {
        node = find('CallExpression', ast);
        assert.strictEqual(node.callee.type, 'Identifier');
        assert.strictEqual(node.callee.name, 'async');
        assert.deepEqual(node.callee.loc, {
          start: {
            line: 1,
            column: 8
          },
          end: {
            line: 1,
            column: 13
          }
        });
      });
    });
  });
});

describe('await', () => {
  describe('-', () => {
    var node;

    beforeEach(() => {
      node = find(
        'AwaitExpression',
        parse([
          'async function foo() {',
          '  x = await bar()',
          '}'
        ])
      );
    });

    it('finds correct start position', () =>
      assert.strictEqual(node.start, 29)
    );

    it('finds correct end position', () =>
      assert.strictEqual(node.end, 40)
    );

    it('finds correct start line/column', () =>
      assert.deepEqual(node.loc.start, {
        line: 2,
        column: 6
      })
    );

    it('finds correct end line/column', () =>
      assert.deepEqual(node.loc.end, {
        line: 2,
        column: 17
      })
    );
  });

  describe('outside a function (awaitAnywhere)', () => {
    var node;

    beforeEach(() => {
      node = find(
        'AwaitExpression',
        parse(
          'x = await bar()',
          {awaitAnywhere:true}
        )
      );
    });

    it('finds correct start position', () =>
      assert.strictEqual(node.start, 4)
    );

    it('finds correct start line/column', () =>
      assert.deepEqual(node.loc.start, {
        line: 1,
        column: 4
      })
    );

    it('finds correct end position', () =>
      assert.strictEqual(node.end, 15)
    );

    it('finds correct end line/column', () =>
      assert.deepEqual(node.loc.end, {
        line: 1,
        column: 15
      })
    );
  });
});
