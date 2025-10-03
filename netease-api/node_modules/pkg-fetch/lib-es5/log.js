"use strict";
/* eslint-disable no-underscore-dangle, no-console */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wasReported = exports.log = void 0;
var progress_1 = __importDefault(require("progress"));
var assert_1 = __importDefault(require("assert"));
var chalk_1 = __importDefault(require("chalk"));
var Log = /** @class */ (function () {
    function Log() {
        this.debugMode = false;
    }
    Log.prototype.lines = function (lines) {
        if (lines === undefined) {
            return;
        }
        if (!Array.isArray(lines)) {
            console.log("  " + lines);
            return;
        }
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            console.log("  " + line);
        }
    };
    Log.prototype.debug = function (text, lines) {
        if (!this.debugMode) {
            return;
        }
        console.log("> " + chalk_1.default.green('[debug]') + " " + text);
        this.lines(lines);
    };
    Log.prototype.info = function (text, lines) {
        console.log("> " + text);
        this.lines(lines);
    };
    Log.prototype.warn = function (text, lines) {
        console.log("> " + chalk_1.default.blue('Warning') + " " + text);
        this.lines(lines);
    };
    Log.prototype.error = function (text, lines) {
        var message = text instanceof Error ? text.stack : text;
        console.log("> " + chalk_1.default.red('Error!') + " " + message);
        this.lines(lines);
    };
    Log.prototype.enableProgress = function (text) {
        (0, assert_1.default)(!this.bar);
        text += ' '.repeat(35 - text.length);
        this.bar = new progress_1.default("  " + text + " [:bar] :percent", {
            stream: process.stdout,
            width: 20,
            complete: '=',
            incomplete: ' ',
            total: 100,
        });
    };
    Log.prototype.showProgress = function (percentage) {
        if (!this.bar) {
            return;
        }
        this.bar.update(percentage / 100);
    };
    Log.prototype.disableProgress = function () {
        if (!this.bar) {
            return;
        }
        // avoid empty line
        if (!this.bar.complete) {
            this.bar.terminate();
        }
        delete this.bar;
    };
    return Log;
}());
exports.log = new Log();
var ReportedError = /** @class */ (function (_super) {
    __extends(ReportedError, _super);
    function ReportedError() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = 'ReportedError';
        _this.wasReported = true;
        return _this;
    }
    return ReportedError;
}(Error));
function wasReported(error, lines) {
    var reportedError = new ReportedError('No message');
    if (typeof error === 'string') {
        exports.log.error(error, lines);
        reportedError = new ReportedError(error);
    }
    return reportedError;
}
exports.wasReported = wasReported;
//# sourceMappingURL=log.js.map