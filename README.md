# docker-cmd-js
Apparently running a **docker** in the `cmd.exe` requires a bunch of environment variables set up. Just spawning a `spawnSync` from `child_process` won't do in most cases. Thus the birth of this lib.

## Why?
What if you have multiple commands that you always run to set up your environment or to deploy a project to AWS?
This is where this project comes in handy:
Example to deply an app to AWS
```javascript
var gulp = require('gulp');
var dockerCmd = require('docker-cmd-js');
var cmd = new dockerCmd.Docker();

gulp.task('deploy', (done) => {
    cmd.debug().run('aws ecr get-login --region us-east-1', true)
        .then((authCmd)=> cmd.run(authCmd))
        .then(()=> cmd.run('docker build -t myapp .'))
        .then(()=> cmd.run('docker tag myapp:latest someawsid.dkr.ecr.us-east-1.amazonaws.com/myapp:latest'))
        .then(()=> cmd.run('docker push someawsid.dkr.ecr.us-east-1.amazonaws.com/myapp:latest'))
        .catch((err) => { console.log(err); })
        .finally(() => { done() });
});
```

## But why a library to run a command?



## Credits
Thanks to [Matt Klein](https://github.com/mattklein999), who started out coding this lib.