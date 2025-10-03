'use strict';

function Transformation () {
    this.mutations = {};
    this.nameCounts = {};
}

Transformation.prototype.register = function (espath, callback) {
    if (!this.mutations[espath]) {
        this.mutations[espath] = [];
    }
    this.mutations[espath].unshift(callback);
};

Transformation.prototype.apply = function (espath, node) {
    this.mutations[espath].forEach(function (callback) {
        callback(node);
    });
};

Transformation.prototype.isTarget = function (espath) {
    return !!this.mutations[espath];
};

Transformation.prototype.generateUniqueName = function (name) {
    if (!this.nameCounts[name]) {
        this.nameCounts[name] = 0;
    }
    this.nameCounts[name] += 1;
    return '_' + name + this.nameCounts[name];
};

module.exports = Transformation;
