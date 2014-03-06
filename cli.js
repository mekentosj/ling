var program = require('commander');

program
  .version(require('./package.json').version)
  .usage('[options] <file ...>')
  .option('-o, --outline', 'list feature names by categories')
  .option('-c, --category [category]', 'filter by feature category')
  .option('-v, --version', 'print the version')
  .parse(process.argv);

if (program.args.length != 1) {
  program.help();
  process.exit(0);
}

program.rootDir = program.args[0];
module.exports = program;
