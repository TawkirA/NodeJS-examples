#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
// import inquirer from 'inquirer';
const inquirer = require('inquirer');
// import Prompt from 'inquirer/lib/prompts/base';
import * as template from './utils/template';
import * as shell from 'shelljs';
import chalk from 'chalk';

const TEMPLATES = fs.readdirSync(path.join(__dirname, 'templates'));
const QUESTIONS = [
    {
        name: 'template',
        type: 'list',
        message: 'Which project whould you like to create?',
        choices: TEMPLATES
    },
    {
        name: 'name',
        type: 'input',
        message: 'Please enter your project name?' 
    }
];

export interface cliOptions {
    projectName: string,
    templateName: string,
    templatePath: string,
    targetPath: string
}

const CURR_DIR = process.cwd();
let isUpdate: Boolean = false;

inquirer.prompt(QUESTIONS).then((answers: any) => {
    const projectChoice = answers['template'];
    const projectName = answers['name'];
    const templatePath = path.join(__dirname, 'templates', projectChoice);
    const targetPath = path.join(CURR_DIR, projectName);

    const options: cliOptions = {
        projectName,
        templateName: projectChoice,
        templatePath,
        targetPath
    }
    console.log(options);

    createProject(targetPath);

    createDirectoryContents(templatePath, projectName);


});

function createProject(projectPath: string) {
    if (fs.existsSync(projectPath)) {
        console.log(chalk.yellowBright('Updating the project...'))
        isUpdate: true;
    }else if (!fs.existsSync(projectPath)) {
        console.log(chalk.yellowBright('Creating the project...'))
        fs.mkdirSync(projectPath);
    }
}

const SKIP_FILES = ['node_modules', '.template.json'];

function createDirectoryContents(templatePath: string, projectName: string) {
    // read all files from template folder
    const filesToCreate = fs.readdirSync(templatePath);
    // loop each file/folder
    filesToCreate.forEach(file => {
        const origFilePath = path.join(templatePath, file);

        // get stats of current file
        const stats = fs.statSync(origFilePath);

        // skip files that should not be copied
        if (SKIP_FILES.indexOf(file) > -1) return;

        if (stats.isFile()) {
            // read file content
            let content = fs.readFileSync(origFilePath, 'utf-8');
            content = template.render(content, {projectName});
            // write file to target folder
            const writePath = path.join(CURR_DIR, projectName, file);
            fs.writeFileSync(writePath, content, 'utf-8');  
        } else if (stats.isDirectory()) {
            // create folder in terget firectory
            if (!fs.existsSync(path.join(CURR_DIR, projectName, file))) {
                // create folder in destination folder
                fs.mkdirSync(path.join(CURR_DIR, projectName, file));
            }
            // copy files/folder inside current folder recursively
            createDirectoryContents(path.join(templatePath, file), path.join(projectName, file));
        }
    })
}

function postProcess(options: cliOptions) {
    const isNode = fs.existsSync(path.join(options.templatePath, 'package.json'))
    if (isNode) {
        shell.cd(options.targetPath);
        const result = shell.exec('npm install')
        if (result.code !== 0) {
            console.log(chalk.redBright('Failed'))
            return false
        }
    }

    if (isUpdate) {
        console.log(chalk.greenBright('Project successfully updated'));
    } else {
        console.log(chalk.greenBright('Project successfully created'));
    }

    return true;
}
