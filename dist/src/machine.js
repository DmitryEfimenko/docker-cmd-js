"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var base_1 = require("./base");
var commonMethods_1 = require("./commonMethods");
var environment_1 = require("./environment");
var Machine = (function (_super) {
    __extends(Machine, _super);
    function Machine(machineName) {
        return _super.call(this, machineName) || this;
    }
    Machine.prototype.status = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ex_1, validErr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, base_1.run("docker-machine status " + this.machineName, this.machineName, this.isDebug, true)];
                    case 1: return [2, _a.sent()];
                    case 2:
                        ex_1 = _a.sent();
                        validErr = "Host does not exist: \"" + this.machineName + "\"";
                        if (ex_1 === validErr + "\n") {
                            return [2, validErr];
                        }
                        else {
                            throw ex_1;
                        }
                        return [3, 3];
                    case 3: return [2];
                }
            });
        });
    };
    Machine.prototype.ipAddress = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ip, ex_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, base_1.run("docker-machine ip " + this.machineName, this.machineName, this.isDebug, true)];
                    case 1:
                        ip = _a.sent();
                        this._ipAddress = ip;
                        return [2, ip];
                    case 2:
                        ex_2 = _a.sent();
                        throw ex_2;
                    case 3: return [2];
                }
            });
        });
    };
    Machine.prototype.start = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var res, c, resp, ex_3, ex_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 13]);
                        return [4, this.runWithoutDebugOnce(this.status())];
                    case 1:
                        res = _a.sent();
                        if (!(res === 'Stopped')) return [3, 3];
                        c = "docker-machine start " + this.machineName;
                        return [4, base_1.run(c, this.machineName, this.isDebug)];
                    case 2:
                        resp = _a.sent();
                        return [3, 6];
                    case 3:
                        if (!(res !== 'Running')) return [3, 5];
                        return [4, this.runStartMachine(opts)];
                    case 4: return [2, _a.sent()];
                    case 5:
                        base_1.Log.info("docker-machine [" + this.machineName + "] status:", res);
                        return [2, res];
                    case 6: return [3, 13];
                    case 7:
                        ex_3 = _a.sent();
                        if (!(ex_3.indexOf('machine does not exist') > -1)) return [3, 9];
                        return [4, this.remove()];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9:
                        _a.trys.push([9, 11, , 12]);
                        return [4, this.runStartMachine(opts)];
                    case 10: return [2, _a.sent()];
                    case 11:
                        ex_4 = _a.sent();
                        throw ex_4;
                    case 12: return [3, 13];
                    case 13: return [2];
                }
            });
        });
    };
    Machine.prototype.remove = function () {
        return base_1.run("docker-machine rm -f " + this.machineName, this.machineName, this.isDebug);
    };
    Machine.prototype.runStartMachine = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var c, progress, resp, ex_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        c = "docker-machine create";
                        if (!opts) {
                            opts = {};
                        }
                        if (!opts.driver) {
                            opts.driver = 'hyperv';
                        }
                        c = base_1.addOpts(c, opts);
                        if (opts.driver === 'virtualbox') {
                            if (!opts.virtualboxMemory) {
                                c = base_1.addOpt(c, '--virtualbox-memory', '6144');
                            }
                            if (!opts.virtualboxNoVtxCheck) {
                                c = base_1.addOpt(c, '--virtualbox-no-vtx-check');
                            }
                        }
                        c += " " + this.machineName;
                        progress = base_1.Log.infoProgress(this.isDebug, "Starting VM \"" + this.machineName + "\"");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, base_1.run(c, this.machineName, this.isDebug)];
                    case 2:
                        resp = _a.sent();
                        environment_1.setEnvironment(this.machineName);
                        base_1.Log.terminateProgress(progress);
                        return [2, resp];
                    case 3:
                        ex_5 = _a.sent();
                        base_1.Log.terminateProgress(progress);
                        if (ex_5.indexOf('Host already exists') === 0) {
                            environment_1.setEnvironment(this.machineName);
                            return [2];
                        }
                        else {
                            throw ex_5;
                        }
                        return [3, 4];
                    case 4: return [2];
                }
            });
        });
    };
    return Machine;
}(commonMethods_1.CommonMethods));
exports.Machine = Machine;
