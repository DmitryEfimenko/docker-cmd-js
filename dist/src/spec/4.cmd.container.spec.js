"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
delete require.cache[require.resolve('../docker-cmd-js')];
const path = require("path");
const const_1 = require("./helpers/const");
const tcpPortUsed = require("tcp-port-used");
const docker_cmd_js_1 = require("../docker-cmd-js");
const image_1 = require("../image");
describe('cmd.container', () => {
    let cmd;
    beforeAll((done) => {
        cmd = new docker_cmd_js_1.Cmd(const_1.machineName);
        const f = path.join(__dirname, 'mysql', 'Dockerfile');
        cmd.image.build('docker_cmd_js_mysql', { file: f }, undefined, image_1.ImageBuildType.buildOnlyIfMissing).then(() => { done(); }, (err) => { done.fail(err); });
    }, 2 * 60 * 1000);
    afterAll((done) => {
        cmd.run(`docker rm -f docker_cmd_js_mysql`)
            .then(() => cmd.image.remove('docker_cmd_js_mysql'))
            .catch((err) => { done.fail(err); })
            .then(() => { done(); });
    });
    it('start()', (done) => {
        cmd.container.start('docker_cmd_js_mysql', { publish: '3306:3306' }).then((wasStarted) => {
            expect(wasStarted).toBeFalsy();
            cmd.run('docker ps').then((res) => {
                const containers = cmd.resToJSON(res);
                expect(containers.length).toBeGreaterThan(0);
                expect(containers[0]['NAMES']).toBe('docker_cmd_js_mysql');
                done();
            });
        }, (err) => {
            done.fail(err);
        });
    });
    it('status()', (done) => {
        cmd.container.status('docker_cmd_js_mysql').then((status) => {
            expect(status.indexOf('Up') === 0).toBeTruthy();
            done();
        }, (err) => { done.fail(err); });
    });
    it('start() on running container', (done) => {
        cmd.container.start('docker_cmd_js_mysql', { publish: '3306:3306' }).then((wasStarted) => {
            expect(wasStarted).toBeTruthy();
            done();
        }, (err) => {
            done.fail(err);
        });
    });
    it('waitForPort()', (done) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield cmd.container.remove('docker_cmd_js_mysql');
            yield cmd.container.start('docker_cmd_js_mysql', { publish: '3306:3306' });
            const ip = yield cmd.machine.ipAddress();
            try {
                const inUse = yield tcpPortUsed.check(3306, ip);
                done();
            }
            catch (ex) {
                yield cmd.container.waitForPort({ port: 3306, timeoutMs: 1 * 60 * 1000 });
                const inUse = yield tcpPortUsed.check(3306, ip);
                expect(inUse).toBe(true);
                done();
            }
        }
        catch (ex) {
            done.fail(ex.stack);
        }
    }), 1 * 60 * 1000);
});
