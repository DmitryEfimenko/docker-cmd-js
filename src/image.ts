import inquirer = require('inquirer');
import { run, runWithoutDebug, addOpts, Log, resToJSON } from './base';
import { CommonMethods } from './commonMethods';

export class Image extends CommonMethods {

  constructor(machineName) {
    super(machineName);
  }

  build(imageName: string, opts?: IBuildImageOpts, pathOrUrl?: string, buildType?: ImageBuildType) {
    if (!buildType) {
      buildType = ImageBuildType.regularBuild;
    }
    return new Promise<boolean | undefined>((resolve, reject) => {
      runWithoutDebug(`docker images --format {{.Repository}} ${imageName}`, this.machineName, true).then(
        (img) => {
          if (img === imageName) {
            // image exists
            if (buildType === ImageBuildType.regularBuild) {
              this.runBuildImage(imageName, opts, pathOrUrl).then(resolve, reject);
            } else if (buildType === ImageBuildType.freshBuild) {
              this.remove(imageName).then(
                () => { this.runBuildImage(imageName, opts, pathOrUrl).then(resolve, reject); },
                reject
              );
            } else if (buildType === ImageBuildType.buildOnlyIfMissing) {
              resolve(undefined);
            } else {
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
              inquirer.prompt(promptOpts).then((answers: any) => {
                if (answers.opts === promptChoices.regularBuild) {
                  this.runBuildImage(imageName, opts, pathOrUrl).then(resolve, reject);
                }
                if (answers.opts === promptChoices.freshBuild) {
                  this.remove(imageName).then(
                    () => { this.runBuildImage(imageName, opts, pathOrUrl).then(resolve, reject); },
                    reject
                  );
                }
                if (answers.opts === promptChoices.noBuild) {
                  resolve(undefined);
                }
              });
            }
          } else {
            this.runBuildImage(imageName, opts, pathOrUrl).then(resolve, reject);
          }
        }
      );
    });
  }

  remove(imageName: string) {
    return run(`docker rmi -f ${imageName}`, this.machineName, this.isDebug);
  }

  checkForDangling() {
    return new Promise((resolve, reject) => {
      runWithoutDebug('docker images --filter dangling=true', this.machineName).then(
        (result) => {
          var images = resToJSON(result);
          if (images.length > 0) {
            let promptOpts = {
              type: 'list',
              name: 'remove',
              message: 'Found dangling images. Would you like to remove them?',
              choices: ['Yes', 'No']
            };
            inquirer.prompt(promptOpts).then((answers: any) => {
              if (answers.remove === 'Yes') {
                let promises = [];
                for (var i = 0, l = images.length; i < l; i++) {
                  let p = this.remove(images[i]['IMAGE ID']);
                  promises.push(p);
                }
                Promise.all(promises).then(
                  () => {
                    Log.success('Cleaned up dangling images.');
                    resolve(true);
                  },
                  (err) => { err('could not clean up dangling images:', err); }
                );
              } else {
                resolve(true);
              }
            });
          } else {
            resolve(true);
          }
        },
        (err) => { err('could not check for dangling images:', err); }
      );
    });
  }

  private runBuildImage(imageName: string, opts: IBuildImageOpts, pathOrUrl: string) {
    return new Promise<boolean>((resolve, reject) => {
      let c = `docker build -t ${imageName}`;
      if (!opts) { opts = {}; }
      c = addOpts(c, opts);
      c += pathOrUrl ? ` ${pathOrUrl}` : ' .';
      let progress = Log.infoProgress(this.isDebug, `Building image ${imageName}`);
      run(c, this.machineName, this.isDebug).then(
        () => {
          Log.terminateProgress(progress).info(`Image ${imageName} built`);
          resolve(true);
        },
        (err: string) => {
          if (err.indexOf('SECURITY WARNING:') > -1) {
            // issue when warning returns as a critical error: https://github.com/docker/docker/issues/22623
            Log.terminateProgress(progress).info(`Image ${imageName} built`);
            resolve(true);
          } else {
            Log.terminateProgress(progress);
            reject(err);
          }
        }
      );
    });
  }
}

export interface IBuildImageOpts {
  buildArg?: string;
  cgroupParent?: string;
  cpuPeriod?: number;
  cpuQuota?: number;
  cpuShares?: number;
  cpusetCpus?: string;
  cpusetMems?: string;
  disableContentTrust?: boolean;
  file?: string;
  forceRm?: boolean;
  help?: boolean;
  isolation?: string;
  label?: string;
  memory?: string;
  memorySwap?: string;
  noCache?: string;
  pull?: boolean;
  quiet?: boolean;
  rm?: boolean;
  shmSize?: string;
  tag?: string;
  ulimit?: string;
}

export enum ImageBuildType {
  regularBuild, freshBuild, buildOnlyIfMissing
}
