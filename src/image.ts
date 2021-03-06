import inquirer = require('inquirer');
import { run, runWithoutDebug, addOpts, Log, resToJSON } from './base';
import { CommonMethods } from './commonMethods';

export class Image extends CommonMethods {

  constructor(machineName) {
    super(machineName);
  }

  async build(imageName: string, opts?: IBuildImageOpts, pathOrUrl?: string, buildType?: ImageBuildType) {
    if (!buildType) {
      buildType = ImageBuildType.regularBuild;
    }

    try {
      const img = await runWithoutDebug(`docker images --format {{.Repository}} ${imageName}`, this.machineName, true);
      if (img === imageName) {
        if (buildType === ImageBuildType.regularBuild) {
          return await this.runBuildImage(imageName, opts, pathOrUrl);
        } else if (buildType === ImageBuildType.freshBuild) {
          await this.remove(imageName);
          return await this.runBuildImage(imageName, opts, pathOrUrl);
        } else if (buildType === ImageBuildType.buildOnlyIfMissing) {
          return undefined;
        } else {
          const promptChoices = {
            freshBuild: 'Fresh build (remove cache)',
            noBuild: 'Don not build',
            regularBuild: 'Regular build (using cache)'
          };
          const promptOpts = {
            choices: [promptChoices.regularBuild, promptChoices.freshBuild, promptChoices.noBuild],
            message: `Image "${imageName}" already exists. What would you like to do?`,
            name: 'opts',
            type: 'list',
          };
          const answers: any = await inquirer.prompt(promptOpts);
          if (answers.opts === promptChoices.regularBuild) {
            return await this.runBuildImage(imageName, opts, pathOrUrl);
          }
          if (answers.opts === promptChoices.freshBuild) {
            await this.remove(imageName);
            return await this.runBuildImage(imageName, opts, pathOrUrl);
          }
          if (answers.opts === promptChoices.noBuild) {
            return undefined;
          }
        }
      } else {
        return await this.runBuildImage(imageName, opts, pathOrUrl);
      }
    } catch (ex) {
      throw ex;
    }
  }

  remove(imageName: string) {
    return run(`docker rmi -f ${imageName}`, this.machineName, this.isDebug);
  }

  async checkForDangling() {
    try {
      const result = await runWithoutDebug('docker images --filter dangling=true', this.machineName);
      const images = resToJSON(result);
      if (images.length > 0) {
        const promptOpts = {
          choices: ['Yes', 'No'],
          message: 'Found dangling images. Would you like to remove them?',
          name: 'remove',
          type: 'list'
        };
        const answers: any = await inquirer.prompt(promptOpts);
        if (answers.remove === 'Yes') {
          const promises = [];
          for (let i = 0, l = images.length; i < l; i++) {
            const p = this.remove(images[i]['IMAGE ID']);
            promises.push(p);
          }
          await Promise.all(promises);
          Log.success('Cleaned up dangling images.');
        }
      }
    } catch (ex) {
      throw ex;
    }
  }

  private async runBuildImage(imageName: string, opts: IBuildImageOpts, pathOrUrl: string) {
    let c = `docker build -t ${imageName}`;
    if (!opts) { opts = {}; }
    c = addOpts(c, opts);
    c += pathOrUrl ? ` ${pathOrUrl}` : ' .';
    const progress = Log.infoProgress(this.isDebug, `Building image ${imageName}`);

    try {
      await run(c, this.machineName, this.isDebug);
      Log.terminateProgress(progress).info(`Image ${imageName} built`);
      return true;
    } catch (ex) {
      if (ex.indexOf('SECURITY WARNING:') > -1) {
        // issue when warning returns as a critical error: https://github.com/docker/docker/issues/22623
        Log.terminateProgress(progress).info(`Image ${imageName} built`);
        return true;
      } else {
        Log.terminateProgress(progress);
        throw ex;
      }
    }
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
