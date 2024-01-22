"use strict";
exports.__esModule = true;
exports.Section = void 0;
var Section = /** @class */ (function () {
    function Section(name) {
        this.name = name;
        this.actions = [];
    }
    Section.prototype.getName = function () {
        return this.name;
    };
    Section.prototype.getActions = function () {
        return this.actions;
    };
    Section.prototype.addInstruction = function (instruction) {
        this.actions.push(instruction);
        return instruction;
    };
    return Section;
}());
exports.Section = Section;
