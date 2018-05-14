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

