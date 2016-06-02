# docker-cmd-js
Run docker commands in your javascript - useful for use in gulp

## Why?
What if you have multiple commands that you always run to set up your environment or to deploy a project to AWS?
This is where this project comes in handy:
Example to deply an app to AWS
```javascript
var gulp = require('gulp');
var dockerCmd = require('docker-cmd-js');
var cmd = new dockerCmd.Docker();

gulp.task('deploy', (done) => {
    var loginCmd = cmd.run('aws ecr get-login --region us-east-1');
    checkRunError(loginCmd.stdErr, done);
    var loginResult = cmd.run(loginCmd.stdOut);
    checkRunError(loginResult.stdErr, done);
    var buildResult = cmd.run('docker build -t myapp .');
    checkRunError(buildResult.stdErr, done);
    var tagResult = cmd.run('docker tag myapp:latest someamazonlink.ecr.us-east-1.amazonaws.com/myapp:latest');
    checkRunError(tagResult.stdErr, done);
    var pushResult = cmd.run('docker push someamazonlink.ecr.us-east-1.amazonaws.com/myapp:latest');
    checkRunError(pushResult.stdErr, done);
    done();
});

function checkRunError(err, done) {
    if (err) {
        console.log(err);
        done();
    }
}
```

## But why a library to run a command?

Apparently running a **docker** cmd requires a bunch of environment variables set up. Just spawning a `spawnSync` from `child_process` won't do in most cases.
