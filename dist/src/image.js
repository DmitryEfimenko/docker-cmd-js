"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const inquirer = require('inquirer');
const base_1 = require('./base');
const commonMethods_1 = require('./commonMethods');
class Image extends commonMethods_1.CommonMethods {
    constructor(machineName) {
        super(machineName);
    }
    build(imageName, opts, pathOrUrl, buildType) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!buildType) {
                buildType = ImageBuildType.regularBuild;
            }
            try {
                let img = yield base_1.runWithoutDebug(`docker images --format {{.Repository}} ${imageName}`, this.machineName, true);
                if (img === imageName) {
                    if (buildType === ImageBuildType.regularBuild) {
                        return yield this.runBuildImage(imageName, opts, pathOrUrl);
                    }
                    else if (buildType === ImageBuildType.freshBuild) {
                        yield this.remove(imageName);
                        return yield this.runBuildImage(imageName, opts, pathOrUrl);
                    }
                    else if (buildType === ImageBuildType.buildOnlyIfMissing) {
                        return undefined;
                    }
                    else {
                        let promptChoices = {
                            regularBuild: 'Regular build (using cache)',
                            freshBuild: 'Fresh build (remove cache)',
                            noBuild: 'Don not build'
                        };
                        let promptOpts = {
                            type: 'list',
                            name: 'opts',
                            message: `Image "${imageName}" already exists. What would you like to do?`,
                            choices: [promptChoices.regularBuild, promptChoices.freshBuild, promptChoices.noBuild]
                        };
                        let answers = yield inquirer.prompt(promptOpts);
                        if (answers.opts === promptChoices.regularBuild) {
                            return yield this.runBuildImage(imageName, opts, pathOrUrl);
                        }
                        if (answers.opts === promptChoices.freshBuild) {
                            yield this.remove(imageName);
                            return yield this.runBuildImage(imageName, opts, pathOrUrl);
                        }
                        if (answers.opts === promptChoices.noBuild) {
                            return undefined;
                        }
                    }
                }
                else {
                    return yield this.runBuildImage(imageName, opts, pathOrUrl);
                }
            }
            catch (ex) {
                throw ex;
            }
        });
    }
    remove(imageName) {
        return base_1.run(`docker rmi -f ${imageName}`, this.machineName, this.isDebug);
    }
    checkForDangling() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let result = yield base_1.runWithoutDebug('docker images --filter dangling=true', this.machineName);
                var images = base_1.resToJSON(result);
                if (images.length > 0) {
                    let promptOpts = {
                        type: 'list',
                        name: 'remove',
                        message: 'Found dangling images. Would you like to remove them?',
                        choices: ['Yes', 'No']
                    };
                    let answers = yield inquirer.prompt(promptOpts);
                    if (answers.remove === 'Yes') {
                        let promises = [];
                        for (var i = 0, l = images.length; i < l; i++) {
                            let p = this.remove(images[i]['IMAGE ID']);
                            promises.push(p);
                        }
                        yield Promise.all(promises);
                        base_1.Log.success('Cleaned up dangling images.');
                    }
                }
            }
            catch (ex) {
                throw ex;
            }
        });
    }
    runBuildImage(imageName, opts, pathOrUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            let c = `docker build -t ${imageName}`;
            if (!opts) {
                opts = {};
            }
            c = base_1.addOpts(c, opts);
            c += pathOrUrl ? ` ${pathOrUrl}` : ' .';
            let progress = base_1.Log.infoProgress(this.isDebug, `Building image ${imageName}`);
            try {
                yield base_1.run(c, this.machineName, this.isDebug);
                base_1.Log.terminateProgress(progress).info(`Image ${imageName} built`);
                return true;
            }
            catch (ex) {
                if (ex.indexOf('SECURITY WARNING:') > -1) {
                    base_1.Log.terminateProgress(progress).info(`Image ${imageName} built`);
                    return true;
                }
                else {
                    base_1.Log.terminateProgress(progress);
                    throw ex;
                }
            }
        });
    }
}
exports.Image = Image;
(function (ImageBuildType) {
    ImageBuildType[ImageBuildType["regularBuild"] = 0] = "regularBuild";
    ImageBuildType[ImageBuildType["freshBuild"] = 1] = "freshBuild";
    ImageBuildType[ImageBuildType["buildOnlyIfMissing"] = 2] = "buildOnlyIfMissing";
})(exports.ImageBuildType || (exports.ImageBuildType = {}));
var ImageBuildType = exports.ImageBuildType;
