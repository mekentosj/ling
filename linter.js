var gherkin = require('gherkin');
var wrench = require('wrench');
var fs = require('fs');
var charm = require('charm')();
var GherkinLexer = require('gherkin').Lexer('en');
var rootDir;
var program;

charm.pipe(process.stdout);

var GherkinParser = function(records) {
  return {
    comment: function(value, line) {
      //records.push({token:'comment',value:value,line:line});
    },
    tag: function(value, line) {
      //records.push({token:'tag',value:value,line:line});
    },
    feature: function(keyword, name, description, line) {
      records.push({
        token: 'feature',
        keyword: keyword,
        name: name,
        description: description,
        line: line
      });
    },
    background: function(keyword, name, description, line) {
      //records.push({token:'background',keyword:keyword,name:name,description:description,line:line});
    },
    scenario: function(keyword, name, description, line) {
      records.push({
        token: 'scenario',
        keyword: keyword,
        name: name,
        description: description,
        line: line
      });
    },
    scenario_outline: function(keyword, name, description, line) {
      records.push({
        token: 'scenario_outline',
        keyword: keyword,
        name: name,
        description: description,
        line: line
      });
    },
    examples: function(keyword, name, description, line) {
      //records.push({token:'examples',keyword:keyword,name:name,description:description,line:line});
    },
    step: function(keyword, name, line) {
      //records.push({token:'step',keyword:keyword,name:name,line:line});
    },
    doc_string: function(content_type, string, line) {
      //records.push({token:'doc_string',content_type:content_type,string:string,line:line});
    },
    row: function(row, line) {
      records.push({
        token:'row',
        row: row,
        line: line
      });
    },
    eof: function() {
      records.push({ token:'eof' });
    }
  };
};

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatSpecs(err, files) {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  if (!files) {
    return;
  }

  files.forEach(function(file) {
    if (!file.match(/\.feature$/))
      return;

    if (program.category) {
      if (!file.match(new RegExp('^' + program.category)))
        return;
    }

    var file = rootDir + '/' + file;
    var records = [];
    var parser = GherkinParser(records);
    var lexer = new GherkinLexer(parser);
    var fileData = fs.readFileSync(file).toString();
    var firstEncountered = false;

    lexer.scan(fileData);

    records.forEach(function(record) {
      if (record.token == 'feature') {
        charm.write('\n');

        if (!firstEncountered)
          firstEncountered = true;

        charm.foreground(153);
        charm.write('# ' + capitalize(record.name));
        charm.write('\n');

        charm.foreground(150);

        var descLines = record.description.split('\n').map(function(line) {
          return '> ' + line;
        }).join('\n');

        charm.write(descLines + '\n');
      }

      if (record.token == 'scenario') {
        charm.foreground(138);
        charm.write('  - ' + capitalize(record.name) + '\n');
      }
    });
  });
};

module.exports.run = function(_program) {
  if (_program.outline) {
    module.exports.outline(_program);
  } else {
    module.exports.formatSpecs(_program);
  }
};

module.exports.formatSpecs = function(_program) {
  program = _program;
  rootDir = program.rootDir;
  wrench.readdirRecursive(rootDir, formatSpecs);
};

module.exports.outline = function(_program) {
  program = _program;
  rootDir = program.rootDir;
  charm.foreground('yellow');

  var categories = null;
  var categoriesParsed = false;

  wrench.readdirRecursive(rootDir, function(err, files) {
    if (!files) return;

    // this will be hit on the first iteration
    // because things are done recursively and root level is iterated first
    if (!categoriesParsed) {
      categories = files.filter(function(file) {
        var isValid = fs.lstatSync(rootDir + '/' + file).isDirectory();

        if (program.category) {
          if (!file.match(new RegExp('^' + program.category)))
            isValid = false;
        }

        return isValid;
      });
      categoriesParsed = true;
    }

    var headingPrinted = false;

    files.forEach(function(file) {
      if (!file.match(/\.feature$/)) return;

      if (program.category && !file.match(new RegExp('^' + program.category))) return;

      if (!headingPrinted) {
        charm.foreground(153);
        console.log('\n# ' + capitalize(file.replace(/\/.*/, '')));
        headingPrinted = true;
      }

      var file = rootDir + '/' + file;
      var records = [];
      var parser = GherkinParser(records);
      var lexer = new GherkinLexer(parser);
      var fileData = fs.readFileSync(file).toString();

      lexer.scan(fileData);

      records.forEach(function(record) {
        if (record.token == 'feature') {
          charm.foreground(150);
          charm.write('## ' + capitalize(record.name));
          charm.write('\n');
        }
      });
    });
  });
}
