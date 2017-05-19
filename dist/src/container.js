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
var machine_1 = require("./machine");
var commonMethods_1 = require("./commonMethods");
var tcpPortUsed = require("tcp-port-used");
var Container = (function (_super) {
    __extends(Container, _super);
    function Container(machineName) {
        return _super.call(this, machineName) || this;
    }
    Container.prototype.waitForPort = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var machine, _a, progress, ex_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        if (!opts.retryIntervalMs) {
                            opts.retryIntervalMs = 100;
                        }
                        if (!opts.timeoutMs) {
                            opts.timeoutMs = 5000;
                        }
                        if (!!opts.host) return [3, 2];
                        machine = new machine_1.Machine(this.machineName);
                        _a = opts;
                        return [4, machine.ipAddress()];
                    case 1:
                        _a.host = _b.sent();
                        _b.label = 2;
                    case 2:
                        progress = base_1.Log.infoProgress(this.isDebug, "waiting for port " + opts.host + ":" + opts.port + " for " + opts.timeoutMs / 1000 + " s");
                        return [4, tcpPortUsed.waitUntilUsedOnHost(opts.port, opts.host, opts.retryIntervalMs, opts.timeoutMs)];
                    case 3:
                        _b.sent();
                        base_1.Log.terminateProgress(progress);
                        return [3, 5];
                    case 4:
                        ex_1 = _b.sent();
                        throw ex_1;
                    case 5: return [2];
                }
            });
        });
    };
    Container.prototype.start = function (imageName, opts, command, extraOpts) {
        return __awaiter(this, void 0, void 0, function () {
            function removeAndStart(contName, pr) {
                return __awaiter(this, void 0, void 0, function () {
                    var ex_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 3, , 4]);
                                return [4, self.remove(contName)];
                            case 1:
                                _a.sent();
                                return [4, startContainer(contName, pr)];
                            case 2: return [2, _a.sent()];
                            case 3:
                                ex_2 = _a.sent();
                                throw ex_2;
                            case 4: return [2];
                        }
                    });
                });
            }
            function startContainer(contName, pr) {
                return __awaiter(this, void 0, void 0, function () {
                    var c, ex_3;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                c = "docker run -d";
                                if (!opts) {
                                    opts = {};
                                }
                                c = base_1.addOpts(c, opts);
                                if (!opts.name) {
                                    c = base_1.addOpt(c, '--name', contName);
                                }
                                c += " " + imageName;
                                if (command) {
                                    c += " " + command;
                                }
                                return [4, base_1.run(c, self.machineName, self.isDebug)];
                            case 1:
                                _a.sent();
                                base_1.Log.terminateProgress(pr).info("Container \"" + contName + "\" started.");
                                return [2, false];
                            case 2:
                                ex_3 = _a.sent();
                                base_1.Log.terminateProgress(pr);
                                throw ex_3;
                            case 3: return [2];
                        }
                    });
                });
            }
            var self, containerName, progress, status, ex_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        containerName = (opts && opts.name) ? opts.name : imageName;
                        progress = base_1.Log.infoProgress(this.isDebug, "Checking if container \"" + containerName + "\" needs to be started");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 20, , 21]);
                        return [4, this.runWithoutDebugOnce(this.status(containerName))];
                    case 2:
                        status = _a.sent();
                        if (!(status === undefined)) return [3, 4];
                        progress = base_1.Log.terminateProgress(progress)
                            .infoProgress(this.isDebug, "Creating and starting container \"" + containerName + "\"");
                        return [4, startContainer(containerName, progress)];
                    case 3: return [2, _a.sent()];
                    case 4:
                        if (!(status === 'Created')) return [3, 9];
                        if (!(extraOpts && extraOpts.startFresh)) return [3, 6];
                        progress = base_1.Log.terminateProgress(progress).infoProgress(this.isDebug, "Container needs to be re-created");
                        return [4, removeAndStart(containerName, progress)];
                    case 5: return [2, _a.sent()];
                    case 6:
                        progress = base_1.Log.terminateProgress(progress)
                            .infoProgress(this.isDebug, "Container \"" + containerName + "\" exists, but not started - starting now.");
                        return [4, startContainer(containerName, progress)];
                    case 7: return [2, _a.sent()];
                    case 8: return [3, 19];
                    case 9:
                        if (!(status.indexOf('Up') === 0)) return [3, 13];
                        if (!(extraOpts && extraOpts.startFresh)) return [3, 11];
                        progress = base_1.Log.terminateProgress(progress).infoProgress(this.isDebug, "Container needs to be re-created");
                        return [4, removeAndStart(containerName, progress)];
                    case 10: return [2, _a.sent()];
                    case 11:
                        base_1.Log.terminateProgress(progress).info("Container \"" + containerName + "\"\" already started.");
                        return [2, true];
                    case 12: return [3, 19];
                    case 13:
                        if (!(status.indexOf('Exited') === 0)) return [3, 18];
                        if (!(extraOpts && extraOpts.startFresh)) return [3, 15];
                        base_1.Log.terminateProgress(progress).info("Container needs to be re-created");
                        return [4, removeAndStart(containerName, progress)];
                    case 14: return [2, _a.sent()];
                    case 15:
                        base_1.Log.terminateProgress(progress)
                            .info("Container \"" + containerName + "\"\" exists but is not started. Starting now.");
                        return [4, base_1.runWithoutDebug("docker start " + containerName, this.machineName)];
                    case 16:
                        _a.sent();
                        return [2, false];
                    case 17: return [3, 19];
                    case 18:
                        base_1.Log.terminateProgress(progress);
                        throw new Error("Could not start container " + containerName + ". Status was \"" + status + "\". Should never hit this.");
                    case 19: return [3, 21];
                    case 20:
                        ex_4 = _a.sent();
                        base_1.Log.terminateProgress(progress);
                        throw ex_4;
                    case 21: return [2];
                }
            });
        });
    };
    Container.prototype.remove = function (containerName) {
        return __awaiter(this, void 0, void 0, function () {
            var c, ex_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        c = "docker rm -f " + containerName;
                        return [4, base_1.run(c, this.machineName, this.isDebug)];
                    case 1:
                        _a.sent();
                        return [3, 3];
                    case 2:
                        ex_5 = _a.sent();
                        throw ex_5;
                    case 3: return [2];
                }
            });
        });
    };
    Container.prototype.status = function (containerName) {
        return __awaiter(this, void 0, void 0, function () {
            var c, res, json, status, i, l, ex_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        c = "docker ps -a --filter name=" + containerName + " --format \"table {{.Names}}\t{{.Status}}\"";
                        return [4, base_1.run(c, this.machineName, this.isDebug)];
                    case 1:
                        res = _a.sent();
                        json = base_1.resToJSON(res);
                        status = void 0;
                        for (i = 0, l = json.length; i < l; i++) {
                            if (json[i]['NAMES'] === containerName) {
                                status = json[i]['STATUS'];
                                break;
                            }
                        }
                        return [2, status];
                    case 2:
                        ex_6 = _a.sent();
                        throw ex_6;
                    case 3: return [2];
                }
            });
        });
    };
    return Container;
}(commonMethods_1.CommonMethods));
exports.Container = Container;
