"use strict";
delete require.cache[require.resolve('../docker-cmd-js')];
const path = require('path');
const docker_cmd_js_1 = require('../docker-cmd-js');
describe('cmd.image', () => {
    let cmd;
    let machineName = 'docker-cmd-js-test';
    beforeAll(() => {
        cmd = new docker_cmd_js_1.Cmd(machineName);
    });
    it('build()', (done) => {
        cmd.image.build('docker_cmd_js_mysql', { file: path.join(__dirname, 'mysql') }).then(() => {
            done();
        }, (err) => {
            done.fail(err);
        });
    }, 2 * 60 * 1000);
    it('build() and replace', (done) => {
        cmd.image.build('docker_cmd_js_mysql', { file: path.join(__dirname, 'mysql') }).then(() => {
            done();
        }, (err) => {
            done.fail(err);
        });
    });
    it('resToJSON()', (done) => {
        cmd.run('docker images').then((res) => {
            let images = cmd.resToJSON(res);
            expect(images.length).toBeGreaterThan(0);
            expect(images[0]['REPOSITORY']).toBeDefined();
            expect(images[0]['TAG']).toBeDefined();
            expect(images[0]['IMAGE ID']).toBeDefined();
            expect(images[0]['CREATED']).toBeDefined();
            expect(images[0]['SIZE']).toBeDefined();
            done();
        }, (err) => { done.fail(err); });
    });
    it('remove()', (done) => {
        cmd.image.remove('docker_cmd_js_mysql').then(() => {
            done();
        }, (err) => {
            done.fail(err);
        });
    });
});