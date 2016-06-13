delete require.cache[require.resolve('../src/docker-cmd-js')];
import * as path from 'path';

import { Cmd } from '../src/docker-cmd-js';

describe('cmd.image', () => {
    let cmd: Cmd;

    beforeAll(() => {
        cmd = new Cmd();
    });  
    
    it('build()', (done) => {
        cmd.image.build('docker_cmd_js_mysql', { pathOrUrl: path.join(__dirname, 'mysql') }).then(
            () => {
                done();
            },
            (err) => {
                done.fail(err);
            }
        );
    });

    it('build() and replace', (done) => {
        cmd.image.build('docker_cmd_js_mysql', { pathOrUrl: path.join(__dirname, 'mysql'), buildAndReplace: true }).then(
            () => {
                done();
            },
            (err) => {
                done.fail(err);
            }
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