/**
 * merge-estraverse-visitors
 *   merge multiple estraverse visitors into one
 * 
 * https://github.com/twada/merge-estraverse-visitors
 *
 * Copyright (c) 2016 Takuto Wada
 * Licensed under the MIT license.
 *   https://twada.mit-license.org/
 */
'use strict';

var estraverse = require('estraverse');


function SubVisitor () {
    this.skipStartNode = null;
    this.broken = false;
}
SubVisitor.prototype.isBroken = function () {
    return !!this.broken;
};
SubVisitor.prototype.markBroken = function () {
    return this.broken = true;
};
SubVisitor.prototype.isSkipping = function (controller) {
    return this.skipStartNode && (this.skipStartNode !== controller.current());
};
SubVisitor.prototype.startSkipping = function (controller) {
    this.skipStartNode = controller.current();
};
SubVisitor.prototype.finishSkippingIfLeavingFrom = function (controller) {
    if (this.skipStartNode === controller.current()) {
        this.skipStartNode = null;
    }
};


function noop () {
}

function createSubVisitors (visitors) {
    var enters = [];
    var leaves = [];
    var subVisitor, i, v, len = visitors.length;
    for(i = 0; i < len; i += 1) {
        v = visitors[i];
        subVisitor = new SubVisitor();
        subVisitor.enter = (typeof v.enter === 'function') ? v.enter : noop;
        subVisitor.leave = (typeof v.leave === 'function') ? v.leave : noop;
        enters.push(subVisitor);
        leaves.unshift(subVisitor);
    }
    return {
        enters: enters,
        leaves: leaves
    };
}


module.exports = function mergeVisitors (visitors) {
    var subVisitors = createSubVisitors(visitors);
    return {
        enter: function (currentNode, parentNode) {
            var orig = this;
            subVisitors.enters.forEach(function (subVisitor) {
                var controller = Object.create(orig);
                if (subVisitor.isBroken()) {
                    return;
                }
                if (subVisitor.isSkipping(controller)) {
                    return;
                }
                controller.notify = function notify (flag) {
                    switch (flag) {
                    case estraverse.VisitorOption.Skip:
                        subVisitor.startSkipping(controller);
                        return;
                    case estraverse.VisitorOption.Break:
                        subVisitor.markBroken();
                        return;
                    default:
                        orig.notify.call(orig, flag);
                    }
                };
                var ret = subVisitor.enter.call(controller, currentNode, parentNode);
                switch (ret) {
                case estraverse.VisitorOption.Skip:
                    subVisitor.startSkipping(controller);
                    break;
                case estraverse.VisitorOption.Break:
                    subVisitor.markBroken();
                    break;
                }
            });
        },
        leave: function (currentNode, parentNode) {
            var orig = this;
            var replacements = [];
            subVisitors.leaves.forEach(function (subVisitor) {
                var controller = Object.create(orig);
                if (subVisitor.isBroken()) {
                    return;
                }
                if (subVisitor.isSkipping(controller)) {
                    return;
                }
                subVisitor.finishSkippingIfLeavingFrom(controller);
                controller.notify = function notify (flag) {
                    switch (flag) {
                    case estraverse.VisitorOption.Skip:
                        // subVisitor.startSkipping(controller);  // meaningless
                        return;
                    case estraverse.VisitorOption.Break:
                        subVisitor.markBroken();
                        return;
                    default:
                        orig.notify.call(orig, flag);
                    }
                };
                var ret = subVisitor.leave.call(controller, currentNode, parentNode);
                switch (ret) {
                case estraverse.VisitorOption.Skip:
                    // subVisitor.startSkipping(controller);  // meaningless
                    return;
                case estraverse.VisitorOption.Break:
                    subVisitor.markBroken();
                    return;
                }
                if (typeof ret === 'object' && ret !== null && typeof ret.type === 'string') {
                    replacements.push(ret);
                }
            });
            if (replacements.length === 1) {
                return replacements[0];
            }
            return undefined;
        }
    };
};
