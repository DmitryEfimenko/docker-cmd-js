"use strict";
delete require.cache[require.resolve('../docker-cmd-js')];
const docker_cmd_js_1 = require('../docker-cmd-js');
describe('Cmd()', () => {
    let cmd;
    let machineName = 'docker-cmd-js-test';
    beforeAll((done) => {
        cmd = new docker_cmd_js_1.Cmd(machineName);
        cmd.machine.start().then(() => { done(); }, (err) => { done.fail(err); });
    }, 5 * 60 * 1000);
    it('should set up Env', () => {
        expect(process.env['DOCKER_TLS_VERIFY']).toBeDefined();
        expect(process.env['DOCKER_HOST']).toBeDefined();
        expect(process.env['DOCKER_CERT_PATH']).toBeDefined();
        expect(process.env['DOCKER_MACHINE_NAME']).toBeDefined();
        expect(process.env['DOCKER_MACHINE_NAME']).toBe(machineName);
    });
    it('run()', (done) => {
        cmd.run(`docker-machine status ${machineName}`).then((status) => {
            expect(status).toBe(`Running\n`);
            done();
        }, (err) => { done.fail(err); });
    });
    it('run() without new lines', (done) => {
        cmd.run(`docker-machine status ${machineName}`, true).then((status) => {
            expect(status).toBe('Running');
            done();
        }, (err) => { done.fail(err); });
    });
    it('runSync()', () => {
        let status = cmd.runSync(`docker-machine status ${machineName}`);
        expect(status.stdOut).toBe('Running\n');
        expect(status.stdErr).toBe('');
    });
    it('run() command with quotes', (done) => {
        cmd.run('docker ps -a -f name=docker --format "table {{.Names}}\t{{.Status}}"').then((res) => { done(); }, (err) => { done.fail(err); });
    });
});
