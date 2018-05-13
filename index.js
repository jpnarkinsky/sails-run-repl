// load and setup readline
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  completer: null,
  removeHistoryDuplicates: true,
  historySize: 100,
  terminal: true,
});

const vm = require('vm');

/*
 * Given a possibly incomplete line of code that may or may not contain nested tokens,
 * returns a list of unclosed tokens.  Nesting tokens include:
 *   - {}
 *   - ()
 *   - []
 *   - ""
 *   - ''
 *   - ``
 *
 * @param {string} slice of line
 *
 * @returns {Array} a list of unclosed tokens.
 * @throws {TokenError} thrown when tokens are not properly nested.
 */
function unclosedTokens(fragment) {
  const tokenPairs = ['{}', '[]', '()', "''", '""', '``'];
  const tokenList = [];

  for (let i = 0; i < fragment.length; i++) {
    const lastPair = tokenList[tokenList.length - 1];
    
    // if this is the closing token, then remove the openner from the list
    if (lastPair && lastPair[1] === fragment[i]) {
      tokenList.pop();
      continue;
    }

    // Find the first openning token
    const pair = tokenPairs.find((j) => j[0] === fragment[i]);

    // If this is an opening token, send it down for processing
    if (pair) {
      // don't require matches for anything besides {} inside template strings
      if (lastPair === '``' && pair !== '{}') {
        continue;
      }

      // don't require matches for anything inside quotes
      if (lastPair === '""' && lastPair === "''") {
        continue;
      }

      tokenList.push(pair);
    }
  }
  return tokenList.map((i) => i[0]);
}

function println(text) {
  process.stdout.write(`${text}\n`);
}

module.exports = {
  friendlyName: 'REPL',
  description: 'Like the sails console, but cooler and more usable',
  inputs: {
  },


  fn: async function(inputs, exits) {
    function evaluator(cmd) {
      if (cmd[cmd.length - 1] === ';') {
        cmd = cmd.slice(0, -1);
      }
      return async function() {
        return vm.runInThisContext(`(${cmd})`);
      };
    }

    let expression = '';
    global.ps1 = 'sails-repl> ';

    rl.on('line', async function(line)  {
      line.trim();

      if (line[0] === '\\') {
        switch (line.slice(1)) {
        case 'quit':
        case 'q':
          sails.log('Anchors aweigh!');
          process.exit(0);
        }
        rl.setPrompt(global.ps1);
        rl.prompt();
      } else if (line === '') {
        rl.setPrompt(global.ps1);
        rl.prompt();
      } else {
        expression = expression + line;
        
        const tokens = unclosedTokens(expression);

        if (tokens.length === 0) {
          const cmd = expression;
          expression = '';
          const result = await (evaluator(cmd)());
          global.$_ = result;
          println(JSON.stringify(result, null, 2));

          rl.setPrompt(global.ps1);
          rl.prompt();
        } else {
          rl.setPrompt(`  { unclosed: ${tokens.join(', ')}}> `);
          rl.prompt();
        }
      }
    }).on('close', function() {
      rl.write('Harsh, dude!\n');
      process.exit(0);
    });

    rl.setPrompt(global.ps1);
    rl.prompt();
  },
};

