'use strict';

var assign = require('core-js/library/fn/object/assign');
var ContextTraversal = require('power-assert-context-traversal');
var LegacyContextTraversal = require('./legacy-context-traversal');
var StringWriter = require('./string-writer');
var defaultOptions = require('./default-options');
var reduce = require('core-js/library/fn/array/reduce');

/**
 * options.reducers [array]
 * options.renderers [array]
 * options.outputOffset [number]
 * options.lineSeparator [string]
 * options.legacy [boolean]
 */
function createFormatter (options) {
    var formatterConfig = assign({}, defaultOptions(), options);
    var reducers = formatterConfig.reducers || [];
    var rendererConfigs = formatterConfig.renderers;
    var len = rendererConfigs.length;

    return function (powerAssertContext) {
        var context = reduce(reducers, function (prevContext, reducer) {
            return reducer(prevContext);
        }, powerAssertContext);
        var writer = new StringWriter(formatterConfig);
        var traversal;
        if (formatterConfig.legacy) {
            traversal = new LegacyContextTraversal(context);
            traversal.setWritable(writer);
        } else {
            traversal = new ContextTraversal(context);
        }
        for (var i = 0; i < len; i += 1) {
            var RendererClass;
            var renderer;
            var config = rendererConfigs[i];
            if (typeof config === 'object') {
                RendererClass = config.ctor;
                renderer = new RendererClass(config.options);
            } else if (typeof config === 'function') {
                RendererClass = config;
                renderer = new RendererClass();
            }
            renderer.init(traversal);
            if (typeof renderer.setWritable === 'function') {
                renderer.setWritable(writer);
            }
        }
        traversal.traverse();
        writer.write('');
        return writer.toString();
    };
}

createFormatter.StringWriter = StringWriter;
module.exports = createFormatter;
