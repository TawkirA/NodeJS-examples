import arg from 'arg';
import inquirer from 'inquirer';
import { createProject } from './main';

function parseArgumentsIntoOptions(rawArgs) {
    const _args = arg(
        {
            '--git': Boolean,
            '--yes': Boolean,
            '--install': Boolean,
            '-g': '--git',
            '-y': '--yes',
            '-i': '--install'
        },
        {
            argv: rawArgs.slice(2)
        }
    );
    return {
        skipPrompts: _args['--yes'] || false,
        git: _args['--git'] || false,
        template: _args._[0],
        runInstall: _args['--install'] || false
    }
}

async function promptForMissingOptions(options) {
    const defaultTemplate = 'JavaScript';

    if (options.skipPrompts) {
        return {
            ...options,
            template: options.template || defaultTemplate
        }
    }

    const questions = [];
    if (!options.template) {
        questions.push({
            type: 'list',
            name: 'template',
            message: 'Please select project template',
            choices: ['JavaScript', 'TypeScript'],
            default: defaultTemplate
        })
    }

    if (!options.git) {
        questions.push({
            type: 'confirm',
            name: 'git',
            message: 'Initialize git repo?',
            default: false
        })
    }

    const answers = await inquirer.prompt(questions);
    return {
        ...options,
        template: options.template || answers.template,
        git: options.git || answers.git
    }
}

export async function cli(args) {
    let options = parseArgumentsIntoOptions(args);
    options = await promptForMissingOptions(options);
    console.log(options)
    await createProject(options);
}