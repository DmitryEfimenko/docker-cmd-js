"use strict";
delete require.cache[require.resolve('../src/docker-cmd-js')];
var path = require('path');
var tcpPortUsed = require('tcp-port-used');
var docker_cmd_js_1 = require('../src/docker-cmd-js');
describe('cmd.container', function () {
    var cmd;
    beforeAll(function (done) {
        cmd = new docker_cmd_js_1.Cmd();
        cmd.image.build('docker_cmd_js_mysql', { pathOrUrl: path.join(__dirname, 'mysql'), buildAndReplace: true }).then(function () { done(); }, function (err) { done.fail(err); });
    }, 1 * 20 * 1000);
    afterAll(function (done) {
        cmd.run('docker rm -f docker_cmd_js_mysql')
            .then(function () { return cmd.image.remove('docker_cmd_js_mysql'); })
            .catch(function (err) { done.fail(err); })
            .then(function () { done(); });
    });
    it('start()', function (done) {
        cmd.container.start('docker_cmd_js_mysql', { publish: '3306:3306' }).then(function () {
            cmd.run('docker ps').then(function (res) {
                var containers = cmd.resToJSON(res);
                expect(containers.length).toBeGreaterThan(0);
                expect(containers[0]['NAMES']).toBe('docker_cmd_js_mysql');
                cmd.run('docker rm -f docker_cmd_js_mysql').then(function () { done(); }, function (err) { done.fail(err); });
            });
        }, function (err) {
            done.fail(err);
        });
    });
    it('waitForPort()', function (done) {
        cmd.container.start('docker_cmd_js_mysql', { publish: '3306:3306' }).then(function () {
            cmd.machine.ipAddress().then(function (ip) {
                tcpPortUsed.check(3306, ip).then(function (inUse) {
                    if (!inUse) {
                        cmd.container.waitForPort({ port: 3306, timeoutMs: 30 * 60 * 1000 }).then(function () {
                            tcpPortUsed.check(3306, ip).then(function (inUse) {
                                expect(inUse).toBe(true);
                                done();
                            }, function (err) { done.fail(err); });
                        }, function (err) { done.fail(err); });
                    }
                    else {
                        done.fail('port is unexpectedly awailable too fast. Was container already started?');
                    }
                }, function (err) { done.fail(err); });
            }, function (err) { done.fail(err); });
        }, function (err) {
            done.fail(err);
        });
    }, 30 * 60 * 1000);
});
