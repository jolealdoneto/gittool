exports.execute = function(args) {
    var common = require('./common.js'),
        targetRepo = args[0],
        shouldMerge = args.length > 1 && args[1] == 'true' || true,
        pullRequestBase = 'hub pull-request -b {{upstream}}:{{targetRepo}} -i {{issueNumber}}'.replace('{{targetRepo}}', targetRepo),
        pushBase = 'git push origin {{featureBranch}}';

    common.getUpstreamAndRepo(function(gitinfo) {
        common.execute('git branch | grep \\* | cut -d\' \' -f2', function(featureBranch) {
            var reg = /.+#([0-9]+)/gi,
                num = reg.exec(featureBranch);

            featureBranch = featureBranch.replace(/\n/g, '');

            if (num != null) {
                common.execute(pushBase.replace('{{featureBranch}}', featureBranch), function() {
                    num = num[1];
                    common.execute(pullRequestBase.replace('{{upstream}}', gitinfo.upstream).replace('{{issueNumber}}', num), function(out) {
                        console.log(out);
                        if (shouldMerge) {
                            var comm = 'git checkout develop && git merge {{featureBranch}} && git branch -D {{featureBranch}}'.replace(/{{featureBranch}}/g, featureBranch).replace(/\n/g, '');
                            console.log(comm);

                            common.execute(comm, function(out) {
                                console.log("done.");
                            });
                        }
                    });
                });
            }
        });
    });

};
