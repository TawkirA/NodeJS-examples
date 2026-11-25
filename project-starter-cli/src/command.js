import arg from "arg";
import inquirer from "inquirer";
import { templateGrabber } from './main.js';

function argumentOptionsParser(rawArguments) {
    let args = arg(
        {
            "--git": Boolean,
            "--help": Boolean,
            "--yes": Boolean,
            "--install": Boolean,
            "--g": "--git",
            "--h": "--help",
            "--y": "--yes",
            "--i": "--install",
        },
        {
            argv: rawArguments.slice(2),
        }
    );
    return {
        template: args._[0],
        skipPrompts: args["--yes"] || false,
        git: args["--git"] || false,
        runInstall: args["--install"] || false,
    }
}

async function inquireUndeclaredItems(opts) {
    const defaultTemplate = "React";
    if (opts.skipPrompts) {
        return {
            ...opts,
            template: opts.template || defaultTemplate
        }
    }

    const displayOptions = [];
    if (!opts.template) {
        displayOptions.push({
            type: 'list',
            name: 'template',
            message: 'Which framework would you like to you?',
            choices: ["React", "Angular", "JavaScript"],
            default: defaultTemplate
        })
    }

    displayOptions.push({
        type: 'input',
        name: 'projectName',
        message: 'Please enter project name?',            
        default: 'dummy'
    })

    if (!opts.git) {
        displayOptions.push({
            type: 'confirm',
            name: 'git',
            message: 'Would you like to use git?',            
            default: false
        }) 
    }

    const userInput = await inquirer.prompt(displayOptions);

    return {
        ...opts,
        template: opts.template || userInput.template,
        projectName: userInput.projectName,
        git: opts.git || userInput.git
    }
}

export async function interfaceCommand(args) {
    let options = argumentOptionsParser(args)
    options = await inquireUndeclaredItems(options)
    // console.log(options);
    await templateGrabber(options);
}