delete require.cache[require.resolve('../docker-cmd-js')];
import * as path from 'path';

import { Cmd } from '../docker-cmd-js';
import { machineName } from './helpers/const';

describe('cmd.image', () => {
  let cmd: Cmd;

  beforeAll(() => {
    cmd = new Cmd(machineName);
  });

  it('build()', (done) => {
    cmd.image.build('docker_cmd_js_mysql', { file: path.join(__dirname, 'mysql', 'Dockerfile') }).then(
      () => {
        done();
      },
      (err) => {
        done.fail(err);
      }
    );
  }, 2 * 60 * 1000);

  it('build() and replace', (done) => {
    cmd.image.build('docker_cmd_js_mysql', { file: path.join(__dirname, 'mysql', 'Dockerfile') }).then(
      () => {
        done();
      },
      (err) => {
        done.fail(err);
      }
    );
  });

  it('resToJSON()', (done) => {
    cmd.run('docker images').then(
      (res) => {
        let images = cmd.resToJSON(res);
        expect(images.length).toBeGreaterThan(0);
        expect(images[0]['REPOSITORY']).toBeDefined();
        expect(images[0]['TAG']).toBeDefined();
        expect(images[0]['IMAGE ID']).toBeDefined();
        expect(images[0]['CREATED']).toBeDefined();
        expect(images[0]['SIZE']).toBeDefined();
        done();
      },
      (err) => { done.fail(err); }
    );
  });

  it('remove()', (done) => {
    cmd.image.remove('docker_cmd_js_mysql').then(
      () => {
        done();
      },
      (err) => {
        done.fail(err);
      }
    );
  });
});
