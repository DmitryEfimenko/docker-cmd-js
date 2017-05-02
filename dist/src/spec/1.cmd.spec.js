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
const docker_cmd_js_1 = require("../docker-cmd-js");
const const_1 = require("./helpers/const");
describe('Cmd()', () => {
    let cmd;
    beforeAll(() => {
        cmd = new docker_cmd_js_1.Cmd(const_1.machineName).debug();
    });
    fit('machine.start()', (done) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield cmd.machine.debug().start();
            done();
        }
        catch (ex) {
            done.fail(ex);
        }
    }), 5 * 60 * 1000);
    it('should set up Env', () => {
        expect(process.env['DOCKER_TLS_VERIFY']).toBeDefined();
        expect(process.env['DOCKER_HOST']).toBeDefined();
        expect(process.env['DOCKER_CERT_PATH']).toBeDefined();
        expect(process.env['DOCKER_MACHINE_NAME']).toBeDefined();
        expect(process.env['DOCKER_MACHINE_NAME']).toBe(const_1.machineName);
    });
    it('run()', (done) => {
        cmd.run(`docker-machine status ${const_1.machineName}`).then((status) => {
            expect(status).toBe(`Running\n`);
            done();
        }, (err) => { done.fail(err); });
    });
    it('run() without new lines', (done) => {
        cmd.run(`docker-machine status ${const_1.machineName}`, true).then((status) => {
            expect(status).toBe('Running');
            done();
        }, (err) => { done.fail(err); });
    });
    it('runSync()', () => {
        const status = cmd.runSync(`docker-machine status ${const_1.machineName}`);
        expect(status.stdOut).toBe('Running\n');
        expect(status.stdErr).toBe('');
    });
    it('run() command with quotes', (done) => {
        cmd.run('docker ps -a -f name=docker --format "table {{.Names}}\t{{.Status}}"').then((res) => { done(); }, (err) => { done.fail(err); });
    });
});
