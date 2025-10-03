var asyncExit = /^async[\t ]+(return|throw)/ ;
var atomOrPropertyOrLabel = /^\s*[):;]/ ;
var removeComments = /([^\n])\/\*(\*(?!\/)|[^\n*])*\*\/([^\n])/g ;

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
function subParse(parser, pos, extensions) {
    var p = new parser.constructor(parser.options, parser.input, pos);
    if (extensions)
        for (var k in extensions)
            p[k] = extensions[k] ;

    var src = parser ;
    var dest = p ;
    ['inFunction','inAsync','inGenerator','inModule'].forEach(function(k){
        if (k in src)
            dest[k] = src[k] ;
    }) ;
    p.nextToken();
    return p;
}

function asyncAwaitPlugin (parser,options){
    if (!options || typeof options !== "object")
        options = {} ;

    parser.extend("parse",function(base){
        return function(){
            this.inAsync = options.inAsyncFunction ;
            if (options.awaitAnywhere && options.inAsyncFunction)
                parser.raise(node.start,"The options awaitAnywhere and inAsyncFunction are mutually exclusive") ;

            return base.apply(this,arguments);
        }
    }) ;

    parser.extend("parseStatement",function(base){
        return function (declaration, topLevel) {
            var start = this.start;
            var startLoc = this.startLoc;
            if (this.type.label==='name') {
                if ((options.asyncExits) && test(asyncExit,this)) {
                    // TODO: Ensure this function is itself nested in an async function or Method
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
        return function(liberal) {
            if (this.options.sourceType==='module' && this.options.ecmaVersion >= 8 && options.awaitAnywhere)
                return base.call(this,true) ; // Force liberal mode if awaitAnywhere is set
            return base.apply(this,arguments) ;
        }
    }) ;

    parser.extend("parseExprAtom",function(base){
        var NotAsync = {};
        return function(refShorthandDefaultPos){
            var start = this.start ;
            var startLoc = this.startLoc;

            var rhs,r = base.apply(this,arguments);

            if (r.type==='Identifier') {
                if (r.name==='await' && !this.inAsync) {
                    if (options.awaitAnywhere) {
                        var n = this.startNodeAt(r.start, r.loc && r.loc.start);

                        start = this.start ;

                        var parseHooks = {
                            raise:function(){
                                try {
                                    return pp.raise.apply(this,arguments) ;
                                } catch(ex) {
                                    throw /*inBody?ex:*/NotAsync ;
                                }
                            }
                        } ;

                        try {
                            rhs = subParse(this,start-4,parseHooks).parseExprSubscripts() ;
                            if (rhs.end<=start) {
                                rhs = subParse(this,start,parseHooks).parseExprSubscripts() ;
                                n.argument = rhs ;
                                n = this.finishNodeAt(n,'AwaitExpression', rhs.end, rhs.loc && rhs.loc.end) ;
                                this.pos = rhs.end;
                                this.end = rhs.end ;
                                this.endLoc = rhs.endLoc ;
                                this.next();
                                return n ;
                            }
                        } catch (ex) {
                            if (ex===NotAsync)
                                return r ;
                            throw ex ;
                        }
                    }
                }
            }
            return r ;
        }
    }) ;

    var allowedPropValues = {
        undefined:true,
        get:true,
        set:true,
        static:true,
        async:true,
        constructor:true
    };
    parser.extend("parsePropertyName",function(base){
        return function (prop) {
            var prevName = prop.key && prop.key.name ;
            var key = base.apply(this,arguments) ;
            if (this.value==='get') {
                prop.__maybeStaticAsyncGetter = true ;
            }
            var next ;
            if (allowedPropValues[this.value])
                return key ;

            if (key.type === "Identifier" && (key.name === "async" || prevName === "async") && !hasLineTerminatorBeforeNext(this, key.end) 
                // Look-ahead to see if this is really a property or label called async or await
                && !this.input.slice(key.end).match(atomOrPropertyOrLabel)) {
                if (prop.kind === 'set' || key.name === 'set') 
                    this.raise(key.start,"'set <member>(value)' cannot be be async") ;
                else {
                    this.__isAsyncProp = true ;
                    key = base.apply(this,arguments) ;
                    if (key.type==='Identifier') {
                        if (key.name==='set')
                            this.raise(key.start,"'set <member>(value)' cannot be be async") ;
                    }
                }
            } else {
                delete prop.__maybeStaticAsyncGetter ;
            }
            return key;
        };
    }) ;

    parser.extend("parseClassMethod",function(base){
        return function (classBody, method, isGenerator) {
            var r = base.apply(this,arguments) ;
            if (method.__maybeStaticAsyncGetter) {
                delete method.__maybeStaticAsyncGetter ;
                if (method.key.name!=='get')
                    method.kind = "get" ;
            }
            return r ;
        }
    }) ;


    parser.extend("parseFunctionBody",function(base){
        return function (node, isArrowFunction) {
            var wasAsync = this.inAsync ;
            if (this.__isAsyncProp) {
                node.async = true ;
                this.inAsync = true ;
                delete this.__isAsyncProp ;
            }
            var r = base.apply(this,arguments) ;
            this.inAsync = wasAsync ;
            return r ;
        }
    }) ;
}

module.exports = asyncAwaitPlugin ;
