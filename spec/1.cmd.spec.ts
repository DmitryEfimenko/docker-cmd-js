delete require.cache[require.resolve('../src/docker-cmd-js')];

import { Cmd } from '../src/docker-cmd-js';

describe('Cmd()', () => {
    let cmd: Cmd;

    it('should set up Env', () => {
        cmd = new Cmd();
        expect(process.env['DOCKER_TLS_VERIFY']).toBeDefined();
        expect(process.env['DOCKER_HOST']).toBeDefined();
        expect(process.env['DOCKER_CERT_PATH']).toBeDefined();
        expect(process.env['DOCKER_MACHINE_NAME']).toBeDefined();
        expect(process.env['DOCKER_MACHINE_NAME']).toBe('default');
        // if this fails, vm machine might not be started
    });

    it('run()', (done) => {
        cmd.run('docker-machine status').then(
            (status) => {
                expect(status).toBe('Running\n');
                done();
            },
            (err) => { done.fail(err); }
        );
    });

    it('run() without new lines', (done) => {
        cmd.run('docker-machine status', true).then(
            (status) => {
                expect(status).toBe('Running');
                done();
            },
            (err) => { done.fail(err); }
        );
    });

    it('runSync()', () => {
        let status = cmd.runSync('docker-machine status');
        expect(status.stdOut).toBe('Running\n');
        expect(status.stdErr).toBe('');
    });

    it('resToJSON()', (done) => {
        cmd.run('docker images').then(
            (res) => {
                let images = cmd.resToJSON(res);
                expect(images.length).toBeGreaterThan(0);
                expect(images[0]['REPOSITORY']).toBeDefined()
                expect(images[0]['TAG']).toBeDefined()
                expect(images[0]['IMAGE ID']).toBeDefined()
                expect(images[0]['CREATED']).toBeDefined()
                expect(images[0]['SIZE']).toBeDefined()
                done();
            },
            (err) => { done.fail(err); }
        );
    });
});