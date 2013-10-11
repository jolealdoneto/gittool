var https = require('https'),
    exec = require('child_process').exec,
    config = require(process.argv[2]),
    url = '/repos/{{upstream}}/{{repo}}/issues/{{number}}';

function execute(command, callback){
    exec(command, function(error, stdout, stderr){ callback(stdout); });
};

function getBody(url, cb) {
    var auth = (config.username + ':' + config.token);

    https.get({ hostname: 'api.github.com', port: 443, path: url, method: 'GET', auth: auth }, function(res) {
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

function getUpstreamAndRepo(cb) {
    execute('git remote -v | grep upstream', function(stdout) {
        var reg = /.*github.com:([a-zA-Z0-9]+)\/([a-zA-Z0-9]+).git/gi,
            firstLine = stdout.split('/n');

        if (firstLine.length > 0) {
            firstLine = firstLine[0];
        }

        var res = reg.exec(firstLine);

        if (res != null) {
            cb({
                upstream: res[1],
                repository: res[2]
            });
        }
    });
}

exports.execute = execute;
exports.getBody = getBody;
exports.getUpstreamAndRepo = getUpstreamAndRepo;
