'use strict';
/* Simple test script that doesn't need mocha or similar - it just parses stuff and checks the returned AST */
var acorn = require('acorn');
var colors = require('colors');
require('../')(acorn);
function parse(code, pluginOptions, scriptType) {
    if (Array.isArray(code)) {
        code = code.join('\n');
    }
    return acorn.parse(code, {
        sourceType: scriptType,
        ecmaVersion: 8,
        locations: true,
        ranges: true,
        plugins: {
            asyncawait: pluginOptions || {}
        }
    });
}

function isIdentThenFnDecl(ast) {
    return ast.body[0].type === 'ExpressionStatement' && ast.body[0].expression.type === 'Identifier' && ast.body[0].expression.name === 'async' && !ast.body[1].async === true && ast.body[1].type == "FunctionDeclaration";
}

function isAsyncFnDecl(ast) {
    return ast.body[0].async === true && ast.body[0].type === "FunctionDeclaration";
}

function isAsyncFnExpr(ast) {
    return ast.body[0].expression.async === true && ast.body[0].expression.type === "ArrowFunctionExpression";
}

function isExprType(type) {
    return function (ast, sourceType) {
        return ast.body[0].type === 'ExpressionStatement' && ast.body[0].expression.type === type;
    };
}

var tests = [
/* Standard behaviours */
{
    desc: "Simple async function",
    code: "async function x() { return undefined; }",
    pass: function (ast) {
        return ast.body[0].async === true;
    }
},{
    desc: "Simple async function expression",
    code: "(async function (){  })",
    pass: function (ast) {
        return ast.body[0].expression.async === true;
    }
},{
    desc: "Async function expression call (1)",
    code: "(async function (){  }())",
    pass: function (ast) {
        return ast.body[0].expression.callee.async === true;
    }
},{
    desc: "Async function expression call (2)",
    code: "(async function (){  })()",
    pass: function (ast) {
        return ast.body[0].expression.callee.async === true;
    }
},{
    desc: "Await in async is AwaitExpression",
    code: "async function x() { await(undefined); await undefined ; }",
    pass: function (ast) {
        return ast.body[0].body.body[0].expression.type === 'AwaitExpression' && ast.body[0].body.body[1].expression.type === 'AwaitExpression';
    }
},{
    desc: "Await in function is identifier in 'script', illegal in 'module'",
    code: "function x() { await(undefined); }",
    pass: function (ast,scriptType) {
        return scriptType === 'script'?ast.body[0].body.body[0].expression.callee.name === 'await':ast.indexOf("(1:15)")>=0;
    }
},{
    desc: "Async method {code}",
    code: "var a = {async x(){}}",
    pass: function (ast) {
        return ast.body[0].declarations[0].init.properties[0].value.async;
    }
},{
    desc: "Async arrow",
    code: "var a = async()=>0",
    pass: function (ast) {
        return ast.body[0].declarations[0].init.async;
    }
},{
    desc: "Abbreviated async arrow",
    code: "var a = async b=>-b",
    pass: function (ast) {
        return ast.body[0].declarations[0].init.async;
    }
},{
    desc: "Parenthesized async arrow is a call",
    code: "var a = async(b=>0)",
    pass: function (ast) {
        return ast.body[0].declarations[0].init.type==='CallExpression';
    }
},{
    desc: "Await declaration fails in async function",
    code: "async function x() { var await; }",
    pass: function (ex, scriptType) {
      return ex.indexOf("(1:25)")>=0
    }
},{
    desc: "Await function declaration fails in async function",
    code: "async function x() { function await() {} }",
    pass: function (ex, scriptType) {
      return ex.indexOf("(1:30)")>=0
    }
},{
    desc: "Await reference fails in async function",
    code: "async function x() { return 1+await; }",
    pass: function (ex) {
        return !!ex.match(/\(1:3[05]\)/);
    }
},{
    desc: "{code} is an async FunctionExpression",
    code: "async ()=>0",
    pass: isAsyncFnExpr
},{
    desc: "{code} is a CallExpression",
    code: "async(()=>0)",
    pass: isExprType('CallExpression')
},{
    desc: "{code} is an async FunctionDeclaration",
    code: "async /* a */ function x(){}",
    pass: isAsyncFnDecl
},{
    desc: "{code} is a reference to 'async' and a sync FunctionDeclaration",
    code: "async /*\n*/function x(){}",
    pass: isIdentThenFnDecl
},{
    desc: "{code} is a reference to 'async' and a sync FunctionDeclaration",
    code: "async /* a */\nfunction x(){}",
    pass: isIdentThenFnDecl
},{
    desc: "{code} is a reference to 'async' and a sync FunctionDeclaration",
    code: "async\nfunction x(){}",
    pass: isIdentThenFnDecl
},{
    desc: "{code} is a reference to 'async' and a sync FunctionDeclaration",
    code: "async //\nfunction x(){}",
    pass: isIdentThenFnDecl
},{
    desc: "{code} is a reference to 'async' and a sync FunctionDeclaration",
    code: "async /*\n*/\nfunction x(){}",
    pass: isIdentThenFnDecl
},{
    desc: "{code} is a SyntaxError (when inAsyncFunction and awaitAnywhere option are defaults)",
    code: "await x",
    pass: function (ex, sourceType) {
        return sourceType==='module' ? !!ex.match(/\(1:0\)/) : ex === "Unexpected token (1:6)";
    }
},{
    desc: "{code} is a CallExpression in scripts, and a SyntaxError in modules",
    code: "await(x)",
    pass: function(ast,sourceType) {
        return sourceType==='module'?!!ast.match(/\(1:0\)/) :isExprType('CallExpression')(ast)
    }
},{
    desc: "Async method 'constructor' is valid",
    code: "var a = {async constructor(){}}",
    pass: function (ast) {
        var props = ast.body[0].declarations[0].init.properties ;
        return (props[0].kind === 'init' && props[0].key.name==='constructor' && props[0].value.async) 
    }
},{
    desc: "Async class constructor fails",
    code: "class a {async constructor(){}}",
    pass: function (ex) {
        return !!ex.match(/class constructor\(\) cannot be be async \(1:(15|9)\)/) || ex === "Constructor can't be an async method (1:15)";
    }
},{
    desc: "Async setter fails",
    code: "var a = {async set x(y){}}",
    pass: function (ex) {
        return ex === "'set <member>(value)' cannot be be async (1:15)" || ex === "Unexpected token (1:19)";
    }
},{
    desc: "Deprecated async setter fails (use 'async set x')",
    code: "var a = {set async x(y){}}",
    pass: function (ex) {
        return ex === "'set <member>(value)' cannot be be async (1:13)" || ex === "Unexpected token (1:19)";
    }
},{
    desc: "{code} getters/setters are not async",
    code: "var a = {get x(){},set y(z){}}",
    pass: function (ast) {
        var props = ast.body[0].declarations[0].init.properties ;
        return (props[0].kind === 'get' && props[0].key.name==='x' && !props[0].value.async) 
            && (props[1].kind === 'set' && props[1].key.name==='y' && !props[1].value.async);
    }
},{
    desc: "{code} are methods, not getters/setters",
    code: "var a = {async get(){},async set(){}}",
    pass: function (ast) {
        var props = ast.body[0].declarations[0].init.properties ;
        return (props[0].kind === 'init' && props[0].key.name==='get' && props[0].value.async) 
            && (props[1].kind === 'init' && props[1].key.name==='set' && props[1].value.async);
    }
},{
    desc: "In {code}, x is an sync getter",
    code: "class a {get x(){}}",
    pass: function (ast) {
        return ast.body[0].body.body[0].kind==="get" && !ast.body[0].body.body[0].value.async && !ast.body[0].body.body[0].static ; 
    }
},{
    desc: "In {code}, x is an static sync getter",
    code: "class a {static get x(){}}",
    pass: function (ast) {
        return ast.body[0].body.body[0].kind==="get" && !ast.body[0].body.body[0].value.async && ast.body[0].body.body[0].static ; 
    }
},{
    desc: "In {code}, x is an static sync method",
    code: "class a {static async x(){}}",
    pass: function (ast) {
        return ast.body[0].body.body[0].kind==="method" && ast.body[0].body.body[0].value.async && ast.body[0].body.body[0].static ; 
    }
},{
    desc: "{code} are a getters/setters, not methods",
    code: "var a = {get async(){},set async(x){}}",
    pass: function (ast) {
        var props = ast.body[0].declarations[0].init.properties ;
        return (props[0].kind === 'get' && props[0].key.name==='async' && !props[0].value.async)
            && (props[1].kind === 'set' && props[1].key.name==='async' && !props[1].value.async);
    }
},
/* Extended syntax behaviour for Nodent */
{
    desc: "Nodent:".grey+" In {code}, get is a static method",
    code: "class Foo { static get(v) {} }",
    pass: function (ast) {
        return ast.body[0].body.body[0].type==='MethodDefinition'
            && ast.body[0].body.body[0].key.name === 'get'
            && ast.body[0].body.body[0].kind === "method"
            && ast.body[0].body.body[0].static;
    }
},{
    desc: "Nodent:".grey+" In {code}, get is a non-static method",
    code: "class Foo { get(v) {} }",
    pass: function (ast) {
        return ast.body[0].body.body[0].type==='MethodDefinition'
            && ast.body[0].body.body[0].key.name === 'get'
            && ast.body[0].body.body[0].kind === "method"
            && !ast.body[0].body.body[0].static;
    }
},{
    desc: "Nodent:".grey+" In {code}, get is a non-static getter",
    code: "class Foo { get get() {} }",
    pass: function (ast) {
        return ast.body[0].body.body[0].type==='MethodDefinition'
            && ast.body[0].body.body[0].key.name === 'get'
            && ast.body[0].body.body[0].kind === "get"
            && !ast.body[0].body.body[0].static;
    }
},{
    desc: "Nodent:".grey+" In {code}, x is an async getter",
    code: "var a = {async get x(){ await(0) }}",
    pass: function (ast) {
        return ast.body[0].declarations[0].init.properties[0].value.async 
            && ast.body[0].declarations[0].init.properties[0].value.body.body[0].expression.type==='AwaitExpression';
    }
},{
    desc: "Nodent:".grey+" In {code} (deprecated), x is an async getter",
    code: "var a = {get async x(){ await 0 }}",
    pass: function (ast) {
        return ast.body[0].declarations[0].init.properties[0].value.async 
            && ast.body[0].declarations[0].init.properties[0].value.body.body[0].expression.type==='AwaitExpression';
    }
},{
    desc: "Nodent:".grey+" In {code} (deprecated), x is an async getter",
    code: "var a = {get async x(){ await(0) }}",
    pass: function (ast) {
        return ast.body[0].declarations[0].init.properties[0].value.async 
            && ast.body[0].declarations[0].init.properties[0].value.body.body[0].expression.type==='AwaitExpression';
    }
},{
    desc: "Nodent:".grey+" In {code}, x is an async getter",
    code: "class a {async get x(){ await 0 }}",
    pass: function (ast) {
        return ast.body[0].body.body[0].value.async 
            && ast.body[0].body.body[0].value.body.body[0].expression.type==='AwaitExpression';
    }
},{
    desc: "Nodent:".grey+" In {code}, x is an async getter",
    code: "class a {async get x(){ await(0) }}",
    pass: function (ast) {
        return ast.body[0].body.body[0].value.async 
            && ast.body[0].body.body[0].value.body.body[0].expression.type==='AwaitExpression';
    }
},{
    desc: "Nodent:".grey+" In {code} (deprecated), x is an async getter",
    code: "class a {get async x(){ await 0 }}",
    pass: function (ast) {
        return ast.body[0].body.body[0].value.async 
            && ast.body[0].body.body[0].value.body.body[0].expression.type==='AwaitExpression';
    }
},{
    desc: "Nodent:".grey+" In {code} (deprecated), x is an async getter",
    code: "class a {get async x(){ await(0) }}",
    pass: function (ast) {
        return ast.body[0].body.body[0].value.async 
            && ast.body[0].body.body[0].value.body.body[0].expression.type==='AwaitExpression';
    }
},{
    desc: "Nodent:".grey+" In {code}, x is an static async getter",
    code: "class a {static async get x(){}}",
    pass: function (ast) {
        return ast.body[0].body.body[0].kind==="get" && ast.body[0].body.body[0].value.async && ast.body[0].body.body[0].static ; 
    }
},{
    desc: "Nodent:".grey+" In {code} (deprecated), x is an static async getter",
    code: "class a {static get async x(){}}",
    pass: function (ast) {
        return ast.body[0].body.body[0].kind==="get" && ast.body[0].body.body[0].value.async && ast.body[0].body.body[0].static ; 
    }
},{
    desc: "Nodent:".grey+" {code} is an AwaitExpression when inAsyncFunction option is true",
    code: "await(x)",
    options: {
        inAsyncFunction: true
    },
    pass: isExprType('AwaitExpression')
},{
    desc: "Nodent:".grey+" {code} is an AwaitExpression when inAsyncFunction option is true",
    code: "await x",
    options: {
        inAsyncFunction: true
    },
    pass: isExprType('AwaitExpression')
},{
    desc: "Nodent:".grey+" {code} is a CallExpression when awaitAnywhere option is true",
    code: "await(x)",
    options: {
        awaitAnywhere: true
    },
    pass: isExprType('CallExpression')
},{
    desc: "Nodent:".grey+" {code} is an AwaitExpression when awaitAnywhere option is true",
    code: "await x",
    options: {
        awaitAnywhere: true
    },
    pass: isExprType('AwaitExpression')
}];
// TODO: Add tests for asyncExits, noAsyncGetters

var out = {
    true: "pass".green,
    false: "fail".red
};
var testNumber = +process.argv[2] || 0;
if (testNumber) {
    tests = [tests[testNumber - 1]];
} else {
    testNumber += 1;
}
var results = {
    true: 0,
    false: 0
};

tests.forEach(function (test, idx) {
    ['script','module'].forEach(function(scriptType){
        var code = test.code.replace(/\n/g, ' <linefeed> ');
        var desc = test.desc.replace('{code}', code.yellow);
        var pass = function () {
            var p = test.pass.apply(this, arguments);
            results[p] += 1;
            return p;
        };
        var prefix = idx + testNumber + " (" + scriptType + ", acorn v" + acorn.version+")\t" ;
        try {
            console.log(prefix, desc, out[pass(parse(test.code, test.options, scriptType),scriptType)]);
        } catch (ex) {
            try {
                console.log(prefix, desc, ex.message.cyan, out[pass(ex.message,scriptType)]);
            } catch (ex) {
                console.log(prefix, desc, ex.message.magenta, out[false]);
                results.false += 1;
            }
        }
    });
}) ;
console.log('');
if (results.true)
    console.log((results.true + " of " + tests.length*2 + " tests passed").green);
if (results.false) {
    console.log((results.false + " of " + tests.length*2 + " tests failed").red);
    var exit = new Error("Test failed") ;
    exit.stack = "" ;
    throw exit ;
}
