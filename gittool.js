var command = process.argv[3],
    mod = require('./' + command + '.js');

mod.execute(process.argv.splice(4));
