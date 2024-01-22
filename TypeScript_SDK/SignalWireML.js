"use strict";
exports.__esModule = true;
exports.SignalWireML = void 0;
var Section_1 = require("./Section");
var YAML = require("yaml");
var SignalWireML = /** @class */ (function () {
    function SignalWireML() {
        this.sections = {};
    }
    SignalWireML.prototype.addSection = function (name) {
        if (name instanceof Section_1.Section) {
            // Is Section, no need to instantiate a new Section Object
            this.sections[name.getName()] = name.getActions();
            return name;
        }
        else {
            var section = new Section_1.Section(name);
            this.sections[name] = section.getActions();
            return section;
        }
    };
    SignalWireML.prototype.toJSON = function () {
        return JSON.stringify({ sections: this.sections }, null, 4);
    };
    SignalWireML.prototype.toYAML = function () {
        return YAML.stringify({ sections: this.sections }, null);
    };
    return SignalWireML;
}());
exports.SignalWireML = SignalWireML;
