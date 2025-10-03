 (function () {
    "use strict";
    const acorn = require('acorn'); // 3.x
    require('..')(acorn);
    var code = "(async function x(){ console.log('hello'); }());";
    var ast = acorn.parse(code,{
        // Specify use of the plugin
        plugins:{asyncawait:true},
        // Specify the ecmaVersion
        ecmaVersion: 7
    }) ;
    // Show the AST
    console.log(JSON.stringify(ast,null,2)) ;
   }());

