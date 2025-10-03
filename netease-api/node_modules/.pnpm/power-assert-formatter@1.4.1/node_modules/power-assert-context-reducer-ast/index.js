'use strict';

var parser = require('acorn');
require('acorn-es7-plugin')(parser);
var estraverse = require('estraverse');
var purifyAst = require('espurify').customize({extra: ['range']});
var assign = require('core-js/library/fn/object/assign');

module.exports = function (powerAssertContext) {
    var source = powerAssertContext.source;
    if (source.ast && source.tokens && source.visitorKeys) {
        return powerAssertContext;
    }
    var astAndTokens;
    try {
        astAndTokens = parse(source);
    } catch (e) {
        return assign({}, powerAssertContext, { source: assign({}, source, { error: e }) });
    }
    var newSource = assign({}, source, {
        ast: purifyAst(astAndTokens.expression),
        tokens: astAndTokens.tokens,
        visitorKeys: estraverse.VisitorKeys
    });
    return assign({}, powerAssertContext, { source: newSource });
};

function parserOptions(tokens) {
    return {
        sourceType: 'module',
        ecmaVersion: 2018,
        locations: true,
        ranges: false,
        onToken: tokens,
        plugins: {asyncawait: true}
    };
}

function parse (source) {
    var code = source.content;
    var ast, tokens;

    function doParse(wrapper) {
        var content = wrapper ? wrapper(code) : code;
        var tokenBag = [];
        ast = parser.parse(content, parserOptions(tokenBag));
        if (wrapper) {
            ast = ast.body[0].body;
            tokens = tokenBag.slice(6, -2);
        } else {
            tokens = tokenBag.slice(0, -1);
        }
    }

    if (source.async) {
        doParse(wrappedInAsync);
    } else if (source.generator) {
        doParse(wrappedInGenerator);
    } else {
        doParse();
    }

    var exp = ast.body[0].expression;
    var columnOffset = exp.loc.start.column;
    var offsetTree = estraverse.replace(exp, {
        keys: estraverse.VisitorKeys,
        enter: function (eachNode) {
            if (!eachNode.loc && eachNode.range) {
                // skip already visited node
                return eachNode;
            }
            eachNode.range = [
                eachNode.loc.start.column - columnOffset,
                eachNode.loc.end.column - columnOffset
            ];
            delete eachNode.loc;
            return eachNode;
        }
    });

    return {
        tokens: offsetAndSlimDownTokens(tokens),
        expression: offsetTree
    };
}

function wrappedInGenerator (jsCode) {
    return 'function *wrapper() { ' + jsCode + ' }';
}

function wrappedInAsync (jsCode) {
    return 'async function wrapper() { ' + jsCode + ' }';
}

function offsetAndSlimDownTokens (tokens) {
    var i, token, newToken, result = [];
    var columnOffset;
    for(i = 0; i < tokens.length; i += 1) {
        token = tokens[i];
        if (i === 0) {
            columnOffset = token.loc.start.column;
        }
        newToken = {
            type: {
                label: token.type.label
            }
        };
        if (typeof token.value !== 'undefined') {
            newToken.value = token.value;
        }
        newToken.range = [
            token.loc.start.column - columnOffset,
            token.loc.end.column - columnOffset
        ];
        result.push(newToken);
    }
    return result;
}
