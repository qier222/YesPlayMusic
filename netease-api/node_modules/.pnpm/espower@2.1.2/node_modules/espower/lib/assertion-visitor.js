'use strict';

var estraverse = require('estraverse');
var escodegen = require('escodegen');
var espurify = require('espurify');
var espurifyWithRaw = espurify.customize({extra: 'raw'});
var syntax = estraverse.Syntax;
var EspowerLocationDetector = require('espower-location-detector');
var EspowerError = require('./espower-error');
var toBeSkipped = require('./rules/to-be-skipped');
var toBeCaptured = require('./rules/to-be-captured');
var canonicalCodeOptions = {
    format: {
        indent: {
            style: ''
        },
        newline: ''
    },
    verbatim: 'x-verbatim-espower'
};
var recorderClassAst = require('./power-assert-recorder.json');

function AssertionVisitor (matcher, options) {
    this.matcher = matcher;
    this.options = options;
    this.valueRecorder = null;
    this.locationDetector = new EspowerLocationDetector(this.options);
    this.currentArgumentPath = null;
    this.argumentModified = false;
}

AssertionVisitor.prototype.enter = function (controller) {
    this.assertionPath = [].concat(controller.path());
    var currentNode = controller.current();
    this.canonicalCode = this.generateCanonicalCode(currentNode);
    this.location = this.locationDetector.locationFor(currentNode);
    var enclosingFunc = findEnclosingFunction(controller.parents());
    this.withinGenerator = enclosingFunc && enclosingFunc.generator;
    this.withinAsync = enclosingFunc && enclosingFunc.async;
};

AssertionVisitor.prototype.enterArgument = function (controller) {
    var currentNode = controller.current();
    var parentNode = getParentNode(controller);
    var argMatchResult = this.matcher.matchArgument(currentNode, parentNode);
    if (!argMatchResult) {
        return undefined;
    }
    if (argMatchResult.name === 'message' && argMatchResult.kind === 'optional') {
        // skip optional message argument
        return undefined;
    }
    this.verifyNotInstrumented(currentNode);
    // create recorder per argument
    this.valueRecorder = this.createNewRecorder(controller);
    // entering target argument
    this.currentArgumentPath = [].concat(controller.path());
    return undefined;
};

AssertionVisitor.prototype.leave = function (controller) {
    // nothing to do now
};

AssertionVisitor.prototype.leaveArgument = function (resultTree) {
    try {
        return this.argumentModified ? this.captureArgument(resultTree) : resultTree;
    } finally {
        this.currentArgumentPath = null;
        this.argumentModified = false;
        this.valueRecorder = null;
    }
};

AssertionVisitor.prototype.captureNode = function (controller) {
    this.argumentModified = true;
    var currentNode = controller.current();
    var path = controller.path();
    var n = newNodeWithLocationCopyOf(currentNode);
    var relativeEsPath = path.slice(this.assertionPath.length);
    return n({
        type: syntax.CallExpression,
        callee: n({
            type: syntax.MemberExpression,
            computed: false,
            object: this.valueRecorder,
            property: n({
                type: syntax.Identifier,
                name: '_capt'
            })
        }),
        arguments: [
            currentNode,
            n({
                type: syntax.Literal,
                value: relativeEsPath.join('/')
            })
        ]
    });
};

AssertionVisitor.prototype.toBeSkipped = function (controller) {
    var currentNode = controller.current();
    var parentNode = getParentNode(controller);
    var currentKey = getCurrentKey(controller);
    return toBeSkipped(currentNode, parentNode, currentKey);
};

AssertionVisitor.prototype.toBeCaptured = function (controller) {
    var currentNode = controller.current();
    var parentNode = getParentNode(controller);
    var currentKey = getCurrentKey(controller);
    return toBeCaptured(currentNode, parentNode, currentKey);
};

AssertionVisitor.prototype.isCapturingArgument = function () {
    return !!this.currentArgumentPath;
};

AssertionVisitor.prototype.isLeavingAssertion = function (controller) {
    return isPathIdentical(this.assertionPath, controller.path());
};

AssertionVisitor.prototype.isLeavingArgument = function (controller) {
    return isPathIdentical(this.currentArgumentPath, controller.path());
};

// internal

AssertionVisitor.prototype.generateCanonicalCode = function (node) {
    var visitorKeys = this.options.visitorKeys;
    var ast = espurifyWithRaw(node);
    var visitor = {
        leave: function (currentNode, parentNode) {
            if (currentNode.type === syntax.Literal && typeof currentNode.raw !== 'undefined') {
                currentNode['x-verbatim-espower'] = {
                    content : currentNode.raw,
                    precedence : escodegen.Precedence.Primary
                };
                return currentNode;
            } else {
                return undefined;
            }
        }
    };
    if (visitorKeys) {
        visitor.keys = visitorKeys;
    }
    estraverse.replace(ast, visitor);
    return escodegen.generate(ast, canonicalCodeOptions);
};

AssertionVisitor.prototype.captureArgument = function (node) {
    var n = newNodeWithLocationCopyOf(node);
    var props = [];
    addLiteralTo(props, n, 'content', this.canonicalCode);
    addLiteralTo(props, n, 'filepath', this.location.source);
    addLiteralTo(props, n, 'line', this.location.line);
    if (this.withinAsync) {
        addLiteralTo(props, n, 'async', true);
    }
    if (this.withinGenerator) {
        addLiteralTo(props, n, 'generator', true);
    }
    return n({
        type: syntax.CallExpression,
        callee: n({
            type: syntax.MemberExpression,
            computed: false,
            object: this.valueRecorder,
            property: n({
                type: syntax.Identifier,
                name: '_expr'
            })
        }),
        arguments: [node].concat(n({
            type: syntax.ObjectExpression,
            properties: props
        }))
    });
};

AssertionVisitor.prototype.verifyNotInstrumented = function (currentNode) {
    if (currentNode.type !== syntax.CallExpression) {
        return;
    }
    if (currentNode.callee.type !== syntax.MemberExpression) {
        return;
    }
    var prop = currentNode.callee.property;
    if (prop.type === syntax.Identifier && prop.name === '_expr') {
        var errorMessage = 'Attempted to transform AST twice.';
        if (this.options.path) {
            errorMessage += ' path: ' + this.options.path;
        }
        throw new EspowerError(errorMessage, this.verifyNotInstrumented);
    }
};

AssertionVisitor.prototype.createNewRecorder = function (controller) {
    var currentBlock = findBlockedScope(this.options.scopeStack).block;
    var scopeBlockEspath = findEspathOfAncestorNode(currentBlock, controller);
    var recorderConstructorName = this.getRecorderConstructorName(controller);
    var recorderVariableName = this.options.transformation.generateUniqueName('rec');

    var currentNode = controller.current();
    var createNode = newNodeWithLocationCopyOf(currentNode);
    var ident = createNode({
        type: syntax.Identifier,
        name: recorderVariableName
    });
    var init = this.createNewExpression(createNode, recorderConstructorName);
    var decl = this.createVariableDeclaration(createNode, ident, init);
    this.options.transformation.register(scopeBlockEspath, function (matchNode) {
        var body;
        if (/Function/.test(matchNode.type)) {
            var blockStatement = matchNode.body;
            body = blockStatement.body;
        } else {
            body = matchNode.body;
        }
        insertAfterUseStrictDirective(decl, body);
    });
    return ident;
};

AssertionVisitor.prototype.getRecorderConstructorName = function (controller) {
    var ctorName = this.options.storage.powerAssertRecorderConstructorName;
    if (!ctorName) {
        ctorName = this.createRecorderClass(controller);
    }
    return ctorName;
};

AssertionVisitor.prototype.createRecorderClass = function (controller) {
    var globalScope = this.options.globalScope;
    var globalScopeBlockEspath = findEspathOfAncestorNode(globalScope.block, controller);
    var createNode = newNodeWithLocationCopyOf(globalScope.block);
    var ctorName = this.options.transformation.generateUniqueName('PowerAssertRecorder');
    var ident = createNode({
        type: syntax.Identifier,
        name: ctorName
    });
    var classDef = updateLocRecursively(espurify(recorderClassAst), createNode, this.options.visitorKeys);
    var decl = this.createVariableDeclaration(createNode, ident, classDef);
    this.options.transformation.register(globalScopeBlockEspath, function (matchNode) {
        insertAfterUseStrictDirective(decl, matchNode.body);
    });
    this.options.storage.powerAssertRecorderConstructorName = ctorName;
    return ctorName;
};

AssertionVisitor.prototype.createVariableDeclaration = function (createNode, ident, init) {
    return createNode({
        type: syntax.VariableDeclaration,
        declarations: [
            createNode({
                type: syntax.VariableDeclarator,
                id: ident,
                init: init
            })
        ],
        kind: 'var'
    });
};

AssertionVisitor.prototype.createNewExpression = function (createNode, constructorName) {
    return createNode({
        type: syntax.NewExpression,
        callee: createNode({
            type: syntax.Identifier,
            name: constructorName
        }),
        arguments: []
    });
};

function addLiteralTo (props, createNode, name, value) {
    if (typeof value !== 'undefined') {
        addToProps(props, createNode, name, createNode({
            type: syntax.Literal,
            value: value
        }));
    }
}

function addToProps (props, createNode, name, value) {
    props.push(createNode({
        type: syntax.Property,
        key: createNode({
            type: syntax.Identifier,
            name: name
        }),
        value: value,
        method: false,
        shorthand: false,
        computed: false,
        kind: 'init'
    }));
}

function updateLocRecursively (node, n, visitorKeys) {
    var visitor = {
        leave: function (currentNode, parentNode) {
            return n(currentNode);
        }
    };
    if (visitorKeys) {
        visitor.keys = visitorKeys;
    }
    estraverse.replace(node, visitor);
    return node;
}

function isPathIdentical (path1, path2) {
    if (!path1 || !path2) {
        return false;
    }
    return path1.join('/') === path2.join('/');
}

function newNodeWithLocationCopyOf (original) {
    return function (newNode) {
        if (typeof original.loc !== 'undefined') {
            var newLoc = {
                start: {
                    line: original.loc.start.line,
                    column: original.loc.start.column
                },
                end: {
                    line: original.loc.end.line,
                    column: original.loc.end.column
                }
            };
            if (typeof original.loc.source !== 'undefined') {
                newLoc.source = original.loc.source;
            }
            newNode.loc = newLoc;
        }
        if (Array.isArray(original.range)) {
            newNode.range = [original.range[0], original.range[1]];
        }
        return newNode;
    };
}

function findBlockedScope (scopeStack) {
    var lastIndex = scopeStack.length - 1;
    var scope = scopeStack[lastIndex];
    if (!scope.block || isArrowFunctionWithConciseBody(scope.block)) {
        return findBlockedScope(scopeStack.slice(0, lastIndex));
    }
    return scope;
}

function isArrowFunctionWithConciseBody (node) {
    return node.type === 'ArrowFunctionExpression' && node.body.type !== 'BlockStatement';
}

function findEspathOfAncestorNode (targetNode, controller) {
    // iterate child to root
    var child, parent;
    var path = controller.path();
    var parents = controller.parents();
    var popUntilParent = function (key) {
        if (parent[key] !== undefined) {
            return;
        }
        popUntilParent(path.pop());
    };
    for (var i = parents.length - 1; i >= 0; i--) {
        parent = parents[i];
        if (child) {
            popUntilParent(path.pop());
        }
        if (parent === targetNode) {
            return path.join('/');
        }
        child = parent;
    }
    return null;
}

function insertAfterUseStrictDirective (decl, body) {
    var firstBody = body[0];
    if (firstBody.type === syntax.ExpressionStatement) {
        var expression = firstBody.expression;
        if (expression.type === syntax.Literal && expression.value === 'use strict') {
            body.splice(1,0, decl);
            return;
        }
    }
    body.unshift(decl);
}

function isFunction (node) {
    switch(node.type) {
    case syntax.FunctionDeclaration:
    case syntax.FunctionExpression:
    case syntax.ArrowFunctionExpression:
        return true;
    }
    return false;
}

function findEnclosingFunction (parents) {
    for (var i = parents.length - 1; i >= 0; i--) {
        if (isFunction(parents[i])) {
            return parents[i];
        }
    }
    return null;
}

function getParentNode (controller) {
    var parents = controller.parents();
    return parents[parents.length - 1];
}

function getCurrentKey (controller) {
    var path = controller.path();
    return path ? path[path.length - 1] : null;
}

module.exports = AssertionVisitor;
