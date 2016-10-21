delete require.cache[require.resolve('../docker-cmd-js')];
import { Cmd } from '../docker-cmd-js';

describe('cmd.machine', () => {
    let cmd: Cmd;
    let machineName = 'docker-cmd-js-test';

    beforeAll(() => {
        cmd = new Cmd(machineName);
    });

    it('remove()', (done) => {
        cmd.machine.remove().then(
            () => {
                cmd.machine.status().then(
                    (status) => {
                        expect(status).toBe(`Host does not exist: "${machineName}"`);
                        done();
                    },
                    (err) => { done.fail(err); }
                );
            },
            (err) => { done.fail(err); }
        );
    }, 3 * 60 * 1000); // 3 minutes
});
