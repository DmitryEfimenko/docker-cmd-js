delete require.cache[require.resolve('../docker-cmd-js')];
import * as path from 'path';
import { machineName } from './helpers/const';
var tcpPortUsed = require('tcp-port-used');

import { Cmd } from '../docker-cmd-js';
import { ImageBuildType } from '../image';

describe('cmd.container', () => {
  let cmd: Cmd;

  beforeAll((done) => {
    cmd = new Cmd(machineName);
    let f = path.join(__dirname, 'mysql', 'Dockerfile');
    cmd.image.build('docker_cmd_js_mysql', { file: f }, undefined, ImageBuildType.buildOnlyIfMissing).then(
      () => { done(); },
      (err) => { done.fail(err); }
    );
  }, 2 * 60 * 1000);

  afterAll((done) => {
    cmd.run(`docker rm -f docker_cmd_js_mysql`)
      .then(() => cmd.image.remove('docker_cmd_js_mysql'))
      .catch((err) => { done.fail(err); })
      .then(() => { done(); });
  });

  it('start()', (done) => {
    cmd.container.start('docker_cmd_js_mysql', { publish: '3306:3306' }).then(
      (wasStarted) => {
        expect(wasStarted).toBeFalsy();
        cmd.run('docker ps').then(
          (res) => {
            let containers = cmd.resToJSON(res);
            expect(containers.length).toBeGreaterThan(0);
            expect(containers[0]['NAMES']).toBe('docker_cmd_js_mysql');
            done();
          }
        );
      },
      (err) => {
        done.fail(err);
      }
    );
  });

  it('status()', (done) => {
    cmd.container.status('docker_cmd_js_mysql').then(
      (status) => {
        expect(status.indexOf('Up') === 0).toBeTruthy();
        done();
      },
      (err) => { done.fail(err); }
    );
  });

  it('start() on running container', (done) => {
    cmd.container.start('docker_cmd_js_mysql', { publish: '3306:3306' }).then(
      (wasStarted) => {
        expect(wasStarted).toBeTruthy();
        done();
      },
      (err) => {
        done.fail(err);
      }
    );
  });

  it('waitForPort()', async (done) => {
    try {
      await cmd.container.remove('docker_cmd_js_mysql');
      await cmd.container.start('docker_cmd_js_mysql', { publish: '3306:3306' });
      const ip = await cmd.machine.ipAddress();
      try {
        let inUse = await tcpPortUsed.check(3306, ip);
        //done.fail('port is unexpectedly awailable too fast. Was container already started?');
        done();
      } catch (ex) {
        await cmd.container.waitForPort({ port: 3306, timeoutMs: 1 * 60 * 1000 });
        console.log('after waitForPort');
        const inUse = await tcpPortUsed.check(3306, ip);
        expect(inUse).toBe(true);
        done();
      }
    } catch (ex) {
      done.fail(ex.stack);
    }
  }, 1 * 60 * 1000);
});
