var http = require('https'),
    exec = require('child_process').exec,
    config = require(process.argv[2]),
    url = '/repos/{{upstream}}/{{repo}}/issues/{{number}}',
    readline = require('readline'),
    issueNumber = process.argv[3];

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function execute(command, callback){
    exec(command, function(error, stdout, stderr){ callback(stdout); });
};

function getBody(url, cb) {
    var auth = (config.username + ':' + config.token);

    http.get({ hostname: 'api.github.com', port: 443, path: url, method: 'GET', auth: auth }, function(res) {
        var body = '';
        res.on('data', function(chunk) {
            body += chunk;
        });
        res.on('end', function() {
            var endResponse = JSON.parse(body)
            cb(res.statusCode, endResponse);
        });
    }).on('error', function(e) {
        cb(res.statusCode, e);
    });
}

function processIssueResponse(status, res) {
    if (status == 200) {
        rl.question('Desired name? (' + res.title + ')?\n', function(answer) {
            execute('git checkout -b feature/{{branchname}}-#{{issueNumber}}'.replace('{{branchname}}', answer).replace('{{issueNumber}}', issueNumber), function() {
                console.log('done :)\n');
            });
            rl.close();
        });
    }
}


execute('git remote -v | grep upstream', function(stdout) {
    var reg = /.*github.com:([a-zA-Z0-9]+)\/([a-zA-Z0-9]+).git/gi,
        firstLine = stdout.split('/n');

    if (firstLine.length > 0) {
        firstLine = firstLine[0];
    }

    var res = reg.exec(firstLine);

    if (res != null) {
        var upstream = res[1],
            repository = res[2],
            requestUrl = url.replace('{{upstream}}', upstream).replace('{{repo}}', repository).replace('{{number}}', issueNumber);

        getBody(requestUrl, processIssueResponse);
    }
});
