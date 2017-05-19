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
var inquirer = require("inquirer");
var base_1 = require("./base");
var commonMethods_1 = require("./commonMethods");
var Image = (function (_super) {
    __extends(Image, _super);
    function Image(machineName) {
        return _super.call(this, machineName) || this;
    }
    Image.prototype.build = function (imageName, opts, pathOrUrl, buildType) {
        return __awaiter(this, void 0, void 0, function () {
            var img, promptChoices, promptOpts, answers, ex_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!buildType) {
                            buildType = ImageBuildType.regularBuild;
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 19, , 20]);
                        return [4, base_1.runWithoutDebug("docker images --format {{.Repository}} " + imageName, this.machineName, true)];
                    case 2:
                        img = _a.sent();
                        if (!(img === imageName)) return [3, 16];
                        if (!(buildType === ImageBuildType.regularBuild)) return [3, 4];
                        return [4, this.runBuildImage(imageName, opts, pathOrUrl)];
                    case 3: return [2, _a.sent()];
                    case 4:
                        if (!(buildType === ImageBuildType.freshBuild)) return [3, 7];
                        return [4, this.remove(imageName)];
                    case 5:
                        _a.sent();
                        return [4, this.runBuildImage(imageName, opts, pathOrUrl)];
                    case 6: return [2, _a.sent()];
                    case 7:
                        if (!(buildType === ImageBuildType.buildOnlyIfMissing)) return [3, 8];
                        return [2, undefined];
                    case 8:
                        promptChoices = {
                            freshBuild: 'Fresh build (remove cache)',
                            noBuild: 'Don not build',
                            regularBuild: 'Regular build (using cache)'
                        };
                        promptOpts = {
                            choices: [promptChoices.regularBuild, promptChoices.freshBuild, promptChoices.noBuild],
                            message: "Image \"" + imageName + "\" already exists. What would you like to do?",
                            name: 'opts',
                            type: 'list',
                        };
                        return [4, inquirer.prompt(promptOpts)];
                    case 9:
                        answers = _a.sent();
                        if (!(answers.opts === promptChoices.regularBuild)) return [3, 11];
                        return [4, this.runBuildImage(imageName, opts, pathOrUrl)];
                    case 10: return [2, _a.sent()];
                    case 11:
                        if (!(answers.opts === promptChoices.freshBuild)) return [3, 14];
                        return [4, this.remove(imageName)];
                    case 12:
                        _a.sent();
                        return [4, this.runBuildImage(imageName, opts, pathOrUrl)];
                    case 13: return [2, _a.sent()];
                    case 14:
                        if (answers.opts === promptChoices.noBuild) {
                            return [2, undefined];
                        }
                        _a.label = 15;
                    case 15: return [3, 18];
                    case 16: return [4, this.runBuildImage(imageName, opts, pathOrUrl)];
                    case 17: return [2, _a.sent()];
                    case 18: return [3, 20];
                    case 19:
                        ex_1 = _a.sent();
                        throw ex_1;
                    case 20: return [2];
                }
            });
        });
    };
    Image.prototype.remove = function (imageName) {
        return base_1.run("docker rmi -f " + imageName, this.machineName, this.isDebug);
    };
    Image.prototype.checkForDangling = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, images, promptOpts, answers, promises, i, l, p, ex_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4, base_1.runWithoutDebug('docker images --filter dangling=true', this.machineName)];
                    case 1:
                        result = _a.sent();
                        images = base_1.resToJSON(result);
                        if (!(images.length > 0)) return [3, 4];
                        promptOpts = {
                            choices: ['Yes', 'No'],
                            message: 'Found dangling images. Would you like to remove them?',
                            name: 'remove',
                            type: 'list'
                        };
                        return [4, inquirer.prompt(promptOpts)];
                    case 2:
                        answers = _a.sent();
                        if (!(answers.remove === 'Yes')) return [3, 4];
                        promises = [];
                        for (i = 0, l = images.length; i < l; i++) {
                            p = this.remove(images[i]['IMAGE ID']);
                            promises.push(p);
                        }
                        return [4, Promise.all(promises)];
                    case 3:
                        _a.sent();
                        base_1.Log.success('Cleaned up dangling images.');
                        _a.label = 4;
                    case 4: return [3, 6];
                    case 5:
                        ex_2 = _a.sent();
                        throw ex_2;
                    case 6: return [2];
                }
            });
        });
    };
    Image.prototype.runBuildImage = function (imageName, opts, pathOrUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var c, progress, ex_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        c = "docker build -t " + imageName;
                        if (!opts) {
                            opts = {};
                        }
                        c = base_1.addOpts(c, opts);
                        c += pathOrUrl ? " " + pathOrUrl : ' .';
                        progress = base_1.Log.infoProgress(this.isDebug, "Building image " + imageName);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, base_1.run(c, this.machineName, this.isDebug)];
                    case 2:
                        _a.sent();
                        base_1.Log.terminateProgress(progress).info("Image " + imageName + " built");
                        return [2, true];
                    case 3:
                        ex_3 = _a.sent();
                        if (ex_3.indexOf('SECURITY WARNING:') > -1) {
                            base_1.Log.terminateProgress(progress).info("Image " + imageName + " built");
                            return [2, true];
                        }
                        else {
                            base_1.Log.terminateProgress(progress);
                            throw ex_3;
                        }
                        return [3, 4];
                    case 4: return [2];
                }
            });
        });
    };
    return Image;
}(commonMethods_1.CommonMethods));
exports.Image = Image;
var ImageBuildType;
(function (ImageBuildType) {
    ImageBuildType[ImageBuildType["regularBuild"] = 0] = "regularBuild";
    ImageBuildType[ImageBuildType["freshBuild"] = 1] = "freshBuild";
    ImageBuildType[ImageBuildType["buildOnlyIfMissing"] = 2] = "buildOnlyIfMissing";
})(ImageBuildType = exports.ImageBuildType || (exports.ImageBuildType = {}));
