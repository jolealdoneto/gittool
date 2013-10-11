exports.execute = function(args) {
    var url = '/repos/{{upstream}}/{{repo}}/issues/{{number}}',
        readline = require('readline'),
        issueNumber = args[0],
        common = require('./common.js');

    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });


    function processIssueResponse(status, res) {
        if (status == 200) {
            rl.question('Desired name? (' + res.title + ')?\n', function(answer) {
                common.execute('git checkout -b feature/{{branchname}}-#{{issueNumber}}'.replace('{{branchname}}', answer).replace('{{issueNumber}}', issueNumber), function() {
                    console.log('done :)\n');
                });
                rl.close();
            });
        }
    }

    common.getUpstreamAndRepo(function(gitinfo) {
        var requestUrl = url.replace('{{upstream}}', gitinfo.upstream).replace('{{repo}}', gitinfo.repository).replace('{{number}}', issueNumber);

        common.getBody(requestUrl, processIssueResponse);
    });
};
