import program from 'commander';
import execa from 'execa';
import inquirer from 'inquirer';
import ora from 'ora';
import Listr from 'listr';
import chalk from 'chalk';
import boxen from 'boxen';
import updateNotifier from 'update-notifier';

import pkg from '../package.json';

export function cli(args) {
  checkVersion();

  console.log(boxen(chalk.yellow('I like cooking'), { padding: 1 }));

  program.version(pkg.version, '-v, --version').usage('<command> [options]');

  program
    .command('hello')
    .description('just a test command')
    .action(function(option) {
      console.log('run hello command');
    });

  program
    .command('run-npm-test')
    .description('run npm test command')
    .action(async function(option) {
      const { stdout } = await execa('npm run test');
      console.log('Done:', stdout);
    });

  program
    .command('ask')
    .description('Ask some questions')
    .action(async function(option) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'What is your name?'
        },
        {
          type: 'confirm',
          name: 'isAdult',
          message: 'Are you over 18 years old?'
        },
        {
          type: 'checkbox',
          name: 'favoriteFrameworks',
          choices: ['Vue', 'React', 'Angular'],
          message: 'What are you favorite frameworks?'
        },
        {
          type: 'list',
          name: 'favoriteLanguage',
          choices: ['Chinese', 'English', 'Japanese'],
          message: 'What is you favorite language?'
        }
      ]);
      console.log('your answers:', answers);
    });

  program
    .command('wait')
    .description('Wait 5 secords')
    .action(async function(option) {
      const spinner = ora('Waiting 5 seconds').start();
      let count = 5;

      await new Promise(resolve => {
        let interval = setInterval(() => {
          if (count <= 0) {
            clearInterval(interval);
            spinner.stop();
            resolve();
          } else {
            count--;
            spinner.text = `Waiting ${count} seconds`;
          }
        }, 1000);
      });
    });

  program
    .command('steps')
    .description('some steps')
    .action(async function(option) {
      const tasks = new Listr([
        {
          title: 'Run step 1',
          task: () =>
            new Promise(resolve => {
              setTimeout(() => resolve('1 Done'), 1000);
            })
        },
        {
          title: 'Run step 2',
          task: () =>
            new Promise(resolve => {
              setTimeout(() => resolve('2 Done'), 1000);
            })
        },
        {
          title: 'Run step 3',
          task: () =>
            new Promise((resolve, reject) => {
              setTimeout(() => reject(new Error('Oh, my god')), 1000);
            })
        }
      ]);

      await tasks.run().catch(err => {
        console.error(err);
      });
    });

  program.parse(args);
}

function checkVersion() {
  const notifier = updateNotifier({ pkg, updateCheckInterval: 0 });

  if (notifier.update) {
    notifier.notify();
  }
}
