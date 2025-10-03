var NotAsync = {} ;
var asyncExit = /^async[\t ]+(return|throw)/ ;
var asyncFunction = /^async[\t ]+function/ ;
var atomOrPropertyOrLabel = /^\s*[():;]/ ;
var removeComments = /([^\n])\/\*(\*(?!\/)|[^\n*])*\*\/([^\n])/g ;
var matchAsyncGet = /\s*(get|set)\s*\(/ ;

function hasLineTerminatorBeforeNext(st, since) {
    return st.lineStart >= since;
}

function test(regex,st,noComment) {
    var src = st.input.slice(st.start) ;
    if (noComment) {
        src = src.replace(removeComments,"$1 $3") ;
  }
    return regex.test(src);
}

/* Create a new parser derived from the specified parser, so that in the
 * event of an error we can back out and try again */
function subParse(parser, pos, extensions,parens) {
    var p = new parser.constructor(parser.options, parser.input, pos);
    if (extensions)
        for (var k in extensions)
            p[k] = extensions[k] ;

    var src = parser ;
    var dest = p ;
    ['inFunction','inAsyncFunction','inAsync','inGenerator','inModule'].forEach(function(k){
        if (k in src)
            dest[k] = src[k] ;
    }) ;
    if (parens)
        p.options.preserveParens = true ;
    p.nextToken();
    return p;
}

//TODO: Implement option noAsyncGetters

function asyncAwaitPlugin (parser,options){
    var es7check = function(){} ;

    parser.extend("initialContext",function(base){
        return function(){
            if (this.options.ecmaVersion < 7) {
                es7check = function(node) {
                    parser.raise(node.start,"async/await keywords only available when ecmaVersion>=7") ;
                } ;
            }
            this.reservedWords = new RegExp(this.reservedWords.toString().replace(/await|async/g,"").replace("|/","/").replace("/|","/").replace("||","|")) ;
            this.reservedWordsStrict = new RegExp(this.reservedWordsStrict.toString().replace(/await|async/g,"").replace("|/","/").replace("/|","/").replace("||","|")) ;
            this.reservedWordsStrictBind = new RegExp(this.reservedWordsStrictBind.toString().replace(/await|async/g,"").replace("|/","/").replace("/|","/").replace("||","|")) ;
            this.inAsyncFunction = options.inAsyncFunction ;
            if (options.awaitAnywhere && options.inAsyncFunction)
                parser.raise(node.start,"The options awaitAnywhere and inAsyncFunction are mutually exclusive") ;

            return base.apply(this,arguments);
        }
    }) ;

    parser.extend("shouldParseExportStatement",function(base){
        return function(){
            if (this.type.label==='name' && this.value==='async' && test(asyncFunction,this)) {
                return true ;
            }
            return base.apply(this,arguments) ;
        }
    }) ;

    parser.extend("parseStatement",function(base){
        return function (declaration, topLevel) {
            var start = this.start;
            var startLoc = this.startLoc;
            if (this.type.label==='name') {
                if (test(asyncFunction,this,true)) {
                    var wasAsync = this.inAsyncFunction ;
                    try {
                        this.inAsyncFunction = true ;
                        this.next() ;
                        var r = this.parseStatement(declaration, topLevel) ;
                        r.async = true ;
                        r.start = start;
                        r.loc && (r.loc.start = startLoc);
                        r.range && (r.range[0] = start);
                        return r ;
                    } finally {
                        this.inAsyncFunction = wasAsync ;
                    }
                } else if ((typeof options==="object" && options.asyncExits) && test(asyncExit,this)) {
                    // NON-STANDARD EXTENSION iff. options.asyncExits is set, the
                    // extensions 'async return <expr>?' and 'async throw <expr>?'
                    // are enabled. In each case they are the standard ESTree nodes
                    // with the flag 'async:true'
                    this.next() ;
                    var r = this.parseStatement(declaration, topLevel) ;
                    r.async = true ;
                    r.start = start;
                    r.loc && (r.loc.start = startLoc);
                    r.range && (r.range[0] = start);
                   return r ;
                }
            }
            return base.apply(this,arguments);
        }
    }) ;

  parser.extend("parseIdent",function(base){
        return function(liberal){
                var id = base.apply(this,arguments);
                if (this.inAsyncFunction && id.name==='await') {
                    if (arguments.length===0) {
                        this.raise(id.start,"'await' is reserved within async functions") ;
                    }
                }
                return id ;
        }
    }) ;

  parser.extend("parseExprAtom",function(base){
        return function(refShorthandDefaultPos){
            var start = this.start ;
            var startLoc = this.startLoc;
            var rhs,r = base.apply(this,arguments);
            if (r.type==='Identifier') {
                if (r.name==='async' && !hasLineTerminatorBeforeNext(this, r.end)) {
                    // Is this really an async function?
                    var isAsync = this.inAsyncFunction ;
                    try {
                        this.inAsyncFunction = true ;
                        var pp = this ;
                        var inBody = false ;

                        var parseHooks = {
                            parseFunctionBody:function(node,isArrowFunction){
                                try {
                                    var wasInBody = inBody ;
                                    inBody = true ;
                                    return pp.parseFunctionBody.apply(this,arguments) ;
                                } finally {
                                    inBody = wasInBody ;
                                }
                            },
                            raise:function(){
                                try {
                                    return pp.raise.apply(this,arguments) ;
                                } catch(ex) {
                                    throw inBody?ex:NotAsync ;
                                }
                            }
                        } ;

                        rhs = subParse(this,this.start,parseHooks,true).parseExpression() ;
                        if (rhs.type==='SequenceExpression')
                            rhs = rhs.expressions[0] ;
                        if (rhs.type === 'CallExpression')
                            rhs = rhs.callee ;
                        if (rhs.type==='FunctionExpression' || rhs.type==='FunctionDeclaration' || rhs.type==='ArrowFunctionExpression') {
                            // Because we don't know if the top level parser supprts preserveParens, we have to re-parse
                            // without it set
                            rhs = subParse(this,this.start,parseHooks).parseExpression() ;
                            if (rhs.type==='SequenceExpression')
                                rhs = rhs.expressions[0] ;
                            if (rhs.type === 'CallExpression')
                                rhs = rhs.callee ;
                            
                            rhs.async = true ;
                            rhs.start = start;
                            rhs.loc && (rhs.loc.start = startLoc);
                            rhs.range && (rhs.range[0] = start);
                            this.pos = rhs.end;
                            this.end = rhs.end ;
                            this.endLoc = rhs.endLoc ;
                            this.next();
                            es7check(rhs) ;
                            return rhs ;
                        }
                    } catch (ex) {
                        if (ex!==NotAsync)
                            throw ex ;
                    }
                    finally {
                        this.inAsyncFunction = isAsync ;
                    }
                }
                else if (r.name==='await') {
                    var n = this.startNodeAt(r.start, r.loc && r.loc.start);
                    if (this.inAsyncFunction) {
                        rhs = this.parseExprSubscripts() ;
                        n.operator = 'await' ;
                        n.argument = rhs ;
                        n = this.finishNodeAt(n,'AwaitExpression', rhs.end, rhs.loc && rhs.loc.end) ;
                        es7check(n) ;
                        return n ;
                    }
                    // NON-STANDARD EXTENSION iff. options.awaitAnywhere is true,
                    // an 'AwaitExpression' is allowed anywhere the token 'await'
                    // could not be an identifier with the name 'await'.

                    // Look-ahead to see if this is really a property or label called async or await
                    if (this.input.slice(r.end).match(atomOrPropertyOrLabel)) {
                        if (!options.awaitAnywhere && this.options.sourceType === 'module')
                            return this.raise(r.start,"'await' is reserved within modules") ;
                        return r ; // This is a valid property name or label
                    }

                    if (typeof options==="object" && options.awaitAnywhere) {
                        start = this.start ;
                        rhs = subParse(this,start-4).parseExprSubscripts() ;
                        if (rhs.end<=start) {
                            rhs = subParse(this,start).parseExprSubscripts() ;
                            n.operator = 'await' ;
                            n.argument = rhs ;
                            n = this.finishNodeAt(n,'AwaitExpression', rhs.end, rhs.loc && rhs.loc.end) ;
                            this.pos = rhs.end;
                            this.end = rhs.end ;
                            this.endLoc = rhs.endLoc ;
                            this.next();
                            es7check(n) ;
                            return n ;
                        }
                    }

                    if (!options.awaitAnywhere && this.options.sourceType === 'module')
                        return this.raise(r.start,"'await' is reserved within modules") ;
                }
            }
            return r ;
        }
    }) ;

    parser.extend('finishNodeAt',function(base){
            return function(node,type,pos,loc) {
                if (node.__asyncValue) {
                    delete node.__asyncValue ;
                    node.value.async = true ;
                }
                return base.apply(this,arguments) ;
            }
    }) ;

    parser.extend('finishNode',function(base){
            return function(node,type) {
                if (node.__asyncValue) {
                    delete node.__asyncValue ;
                    node.value.async = true ;
                }
                return base.apply(this,arguments) ;
            }
    }) ;

    var allowedPropSpecifiers = {
        get:true,
        set:true,
        async:true
    };
    
    parser.extend("parsePropertyName",function(base){
        return function (prop) {
            var prevName = prop.key && prop.key.name ;
            var key = base.apply(this,arguments) ;
            if (key.type === "Identifier" && (key.name === "async") && !hasLineTerminatorBeforeNext(this, key.end)) {
                // Look-ahead to see if this is really a property or label called async or await
                if (!this.input.slice(key.end).match(atomOrPropertyOrLabel)){
                    // Cheese - eliminate the cases 'async get(){}' and async set(){}'
                    if (matchAsyncGet.test(this.input.slice(key.end))) {
                        key = base.apply(this,arguments) ;
                        prop.__asyncValue = true ;
                    } else {
                        es7check(prop) ;
                        if (prop.kind === 'set') 
                            this.raise(key.start,"'set <member>(value)' cannot be be async") ;
                        
                        key = base.apply(this,arguments) ;
                        if (key.type==='Identifier') {
                            if (key.name==='set')
                                this.raise(key.start,"'set <member>(value)' cannot be be async") ;
                        }
                        prop.__asyncValue = true ;
                    }
                }
            }
            return key;
        };
    }) ;

    parser.extend("parseClassMethod",function(base){
        return function (classBody, method, isGenerator) {
            var wasAsync ;
            if (method.__asyncValue) {
                if (method.kind==='constructor')
                    this.raise(method.start,"class constructor() cannot be be async") ;
                wasAsync = this.inAsyncFunction ;
                this.inAsyncFunction = true ;
            }
            var r = base.apply(this,arguments) ;
            this.inAsyncFunction = wasAsync ;
            return r ;
        }
    }) ;

    parser.extend("parseMethod",function(base){
        return function (isGenerator) {
            var wasAsync ;
            if (this.__currentProperty && this.__currentProperty.__asyncValue) {
                wasAsync = this.inAsyncFunction ;
                this.inAsyncFunction = true ;
            }
            var r = base.apply(this,arguments) ;
            this.inAsyncFunction = wasAsync ;
            return r ;
        }
    }) ;

    parser.extend("parsePropertyValue",function(base){
        return function (prop, isPattern, isGenerator, startPos, startLoc, refDestructuringErrors) {
            var prevProp = this.__currentProperty ; 
            this.__currentProperty = prop ;
            var wasAsync ;
            if (prop.__asyncValue) {
                wasAsync = this.inAsyncFunction ;
                this.inAsyncFunction = true ;
            }
            var r = base.apply(this,arguments) ;
            this.inAsyncFunction = wasAsync ;
            this.__currentProperty = prevProp ;
            return r ;
        }
    }) ;
}

module.exports = asyncAwaitPlugin ;
