"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detect = exports.parse = exports.visitorUseSCWD = exports.visitorMalformed = exports.visitorNonLiteral = exports.visitorSuccessful = void 0;
const babelTypes = __importStar(require("@babel/types"));
const babel = __importStar(require("@babel/parser"));
const generator_1 = __importDefault(require("@babel/generator"));
const log_1 = require("./log");
const common_1 = require("./common");
function isLiteral(node) {
    if (node == null) {
        return false;
    }
    if (!node.type.endsWith('Literal')) {
        return false;
    }
    if (node.type === 'TemplateLiteral' && node.expressions.length !== 0) {
        return false;
    }
    return true;
}
function getLiteralValue(node) {
    if (node.type === 'TemplateLiteral') {
        return node.quasis[0].value.raw;
    }
    if (node.type === 'NullLiteral') {
        throw new Error('Unexpected null in require expression');
    }
    if (node.type === 'RegExpLiteral') {
        throw new Error('Unexpected regexp in require expression');
    }
    return node.value;
}
function reconstructSpecifiers(specs) {
    if (!specs || !specs.length) {
        return '';
    }
    const defaults = [];
    for (const spec of specs) {
        if (babelTypes.isImportDefaultSpecifier(spec)) {
            defaults.push(spec.local.name);
        }
    }
    const nonDefaults = [];
    for (const spec of specs) {
        if (babelTypes.isImportSpecifier(spec)) {
            const importedName = babelTypes.isIdentifier(spec.imported)
                ? spec.imported.name
                : spec.imported.value;
            if (spec.local.name === importedName) {
                nonDefaults.push(spec.local.name);
            }
            else {
                nonDefaults.push(`${importedName} as ${spec.local.name}`);
            }
        }
    }
    if (nonDefaults.length) {
        defaults.push(`{ ${nonDefaults.join(', ')} }`);
    }
    return defaults.join(', ');
}
function reconstruct(node) {
    let v = (0, generator_1.default)(node, { comments: false }).code.replace(/\n/g, '');
    let v2;
    while (true) {
        v2 = v.replace(/\[ /g, '[').replace(/ \]/g, ']').replace(/ {2}/g, ' ');
        if (v2 === v) {
            break;
        }
        v = v2;
    }
    return v2;
}
function forge(pattern, was) {
    return pattern
        .replace('{c1}', ', ')
        .replace('{v1}', `"${was.v1}"`)
        .replace('{c2}', was.v2 ? ', ' : '')
        .replace('{v2}', was.v2 ? `"${was.v2}"` : '')
        .replace('{c3}', was.v3 ? ' from ' : '')
        .replace('{v3}', was.v3 ? was.v3 : '');
}
function valid2(v2) {
    return (v2 === undefined ||
        v2 === null ||
        v2 === 'must-exclude' ||
        v2 === 'may-exclude');
}
function visitorRequireResolve(n) {
    if (!babelTypes.isCallExpression(n)) {
        return null;
    }
    if (!babelTypes.isMemberExpression(n.callee)) {
        return null;
    }
    const ci = n.callee.object.type === 'Identifier' &&
        n.callee.object.name === 'require' &&
        n.callee.property.type === 'Identifier' &&
        n.callee.property.name === 'resolve';
    if (!ci) {
        return null;
    }
    if (!n.arguments || !isLiteral(n.arguments[0])) {
        return null;
    }
    return {
        v1: getLiteralValue(n.arguments[0]),
        v2: isLiteral(n.arguments[1]) ? getLiteralValue(n.arguments[1]) : null,
    };
}
function visitorRequire(n) {
    if (!babelTypes.isCallExpression(n)) {
        return null;
    }
    if (!babelTypes.isIdentifier(n.callee)) {
        return null;
    }
    if (n.callee.name !== 'require') {
        return null;
    }
    if (!n.arguments || !isLiteral(n.arguments[0])) {
        return null;
    }
    return {
        v1: getLiteralValue(n.arguments[0]),
        v2: isLiteral(n.arguments[1]) ? getLiteralValue(n.arguments[1]) : null,
    };
}
function visitorImport(n) {
    if (!babelTypes.isImportDeclaration(n)) {
        return null;
    }
    return { v1: n.source.value, v3: reconstructSpecifiers(n.specifiers) };
}
function visitorPathJoin(n) {
    if (!babelTypes.isCallExpression(n)) {
        return null;
    }
    if (!babelTypes.isMemberExpression(n.callee)) {
        return null;
    }
    const ci = n.callee.object &&
        n.callee.object.type === 'Identifier' &&
        n.callee.object.name === 'path' &&
        n.callee.property &&
        n.callee.property.type === 'Identifier' &&
        n.callee.property.name === 'join';
    if (!ci) {
        return null;
    }
    const dn = n.arguments[0] &&
        n.arguments[0].type === 'Identifier' &&
        n.arguments[0].name === '__dirname';
    if (!dn) {
        return null;
    }
    const f = n.arguments && isLiteral(n.arguments[1]) && n.arguments.length === 2; // TODO concat them
    if (!f) {
        return null;
    }
    return { v1: getLiteralValue(n.arguments[1]) };
}
function visitorSuccessful(node, test = false) {
    let was = visitorRequireResolve(node);
    if (was) {
        if (test) {
            return forge('require.resolve({v1}{c2}{v2})', was);
        }
        if (!valid2(was.v2)) {
            return null;
        }
        return {
            alias: was.v1,
            aliasType: common_1.ALIAS_AS_RESOLVABLE,
            mustExclude: was.v2 === 'must-exclude',
            mayExclude: was.v2 === 'may-exclude',
        };
    }
    was = visitorRequire(node);
    if (was) {
        if (test) {
            return forge('require({v1}{c2}{v2})', was);
        }
        if (!valid2(was.v2)) {
            return null;
        }
        return {
            alias: was.v1,
            aliasType: common_1.ALIAS_AS_RESOLVABLE,
            mustExclude: was.v2 === 'must-exclude',
            mayExclude: was.v2 === 'may-exclude',
        };
    }
    was = visitorImport(node);
    if (was) {
        if (test) {
            return forge('import {v3}{c3}{v1}', was);
        }
        return { alias: was.v1, aliasType: common_1.ALIAS_AS_RESOLVABLE };
    }
    was = visitorPathJoin(node);
    if (was) {
        if (test) {
            return forge('path.join(__dirname{c1}{v1})', was);
        }
        return { alias: was.v1, aliasType: common_1.ALIAS_AS_RELATIVE, mayExclude: false };
    }
    return null;
}
exports.visitorSuccessful = visitorSuccessful;
function nonLiteralRequireResolve(n) {
    if (!babelTypes.isCallExpression(n)) {
        return null;
    }
    if (!babelTypes.isMemberExpression(n.callee)) {
        return null;
    }
    const ci = n.callee.object.type === 'Identifier' &&
        n.callee.object.name === 'require' &&
        n.callee.property.type === 'Identifier' &&
        n.callee.property.name === 'resolve';
    if (!ci) {
        return null;
    }
    if (isLiteral(n.arguments[0])) {
        return null;
    }
    const m = n.arguments[1];
    if (!m) {
        return { v1: reconstruct(n.arguments[0]) };
    }
    if (!isLiteral(n.arguments[1])) {
        return null;
    }
    return {
        v1: reconstruct(n.arguments[0]),
        v2: getLiteralValue(n.arguments[1]),
    };
}
function nonLiteralRequire(n) {
    if (!babelTypes.isCallExpression(n)) {
        return null;
    }
    if (!babelTypes.isIdentifier(n.callee)) {
        return null;
    }
    if (n.callee.name !== 'require') {
        return null;
    }
    if (isLiteral(n.arguments[0])) {
        return null;
    }
    const m = n.arguments[1];
    if (!m) {
        return { v1: reconstruct(n.arguments[0]) };
    }
    if (!isLiteral(n.arguments[1])) {
        return null;
    }
    return {
        v1: reconstruct(n.arguments[0]),
        v2: getLiteralValue(n.arguments[1]),
    };
}
function visitorNonLiteral(n) {
    const was = nonLiteralRequireResolve(n) || nonLiteralRequire(n);
    if (was) {
        if (!valid2(was.v2)) {
            return null;
        }
        return {
            alias: was.v1,
            mustExclude: was.v2 === 'must-exclude',
            mayExclude: was.v2 === 'may-exclude',
        };
    }
    return null;
}
exports.visitorNonLiteral = visitorNonLiteral;
function isRequire(n) {
    if (!babelTypes.isCallExpression(n)) {
        return null;
    }
    if (!babelTypes.isIdentifier(n.callee)) {
        return null;
    }
    if (n.callee.name !== 'require') {
        return null;
    }
    const f = n.arguments && n.arguments[0];
    if (!f) {
        return null;
    }
    return { v1: reconstruct(n.arguments[0]) };
}
function isRequireResolve(n) {
    if (!babelTypes.isCallExpression(n)) {
        return null;
    }
    if (!babelTypes.isMemberExpression(n.callee)) {
        return null;
    }
    const ci = n.callee.object.type === 'Identifier' &&
        n.callee.object.name === 'require' &&
        n.callee.property.type === 'Identifier' &&
        n.callee.property.name === 'resolve';
    if (!ci) {
        return null;
    }
    const f = n.type === 'CallExpression' && n.arguments && n.arguments[0];
    if (!f) {
        return null;
    }
    return { v1: reconstruct(n.arguments[0]) };
}
function visitorMalformed(n) {
    const was = isRequireResolve(n) || isRequire(n);
    if (was) {
        return { alias: was.v1 };
    }
    return null;
}
exports.visitorMalformed = visitorMalformed;
function visitorUseSCWD(n) {
    if (!babelTypes.isCallExpression(n)) {
        return null;
    }
    if (!babelTypes.isMemberExpression(n.callee)) {
        return null;
    }
    const ci = n.callee.object.type === 'Identifier' &&
        n.callee.object.name === 'path' &&
        n.callee.property.type === 'Identifier' &&
        n.callee.property.name === 'resolve';
    if (!ci) {
        return null;
    }
    const was = { v1: n.arguments.map(reconstruct).join(', ') };
    if (was) {
        return { alias: was.v1 };
    }
    return null;
}
exports.visitorUseSCWD = visitorUseSCWD;
function traverse(ast, visitor) {
    // modified esprima-walk to support
    // visitor return value and "trying" flag
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stack = [[ast, false]];
    for (let i = 0; i < stack.length; i += 1) {
        const item = stack[i];
        const [node] = item;
        if (node) {
            const trying = item[1] || babelTypes.isTryStatement(node);
            if (visitor(node, trying)) {
                for (const key in node) {
                    if (node[key]) {
                        const child = node[key];
                        if (child instanceof Array) {
                            for (let j = 0; j < child.length; j += 1) {
                                stack.push([child[j], trying]);
                            }
                        }
                        else if (child && typeof child.type === 'string') {
                            stack.push([child, trying]);
                        }
                    }
                }
            }
        }
    }
}
function parse(body) {
    return babel.parse(body, {
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
    });
}
exports.parse = parse;
function detect(body, visitor) {
    let json;
    try {
        json = parse(body);
    }
    catch (error) {
        log_1.log.warn(`Babel parse has failed: ${error.message}`);
    }
    if (!json) {
        return;
    }
    traverse(json, visitor);
}
exports.detect = detect;
//# sourceMappingURL=detector.js.map