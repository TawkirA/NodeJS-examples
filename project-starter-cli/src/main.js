import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import ncp from 'ncp';
import { promisify } from 'util';
import { projectInstall } from 'pkg-install';
import { render } from './utils/template';
import execa from 'execa';
import Listr from 'listr';

const access = promisify(fs.access);

const copy = promisify(ncp);
const CURR_DIR = process.cwd();
const SKIP_FILES = ['node_modules'];

async function createDirectory(opts) {    
    const dirName = path.join(opts.targetDirectory, opts.projectName);
    console.log('TARGET DIR', dirName);
    if (fs.existsSync(dirName)) {
        console.log(chalk.yellowBright('Updating the project...'))
        // isUpdate: true;
    }else if (!fs.existsSync(dirName)) {
        console.log(chalk.yellowBright('Creating the project...'))
        fs.mkdirSync(dirName);
    }    
}

async function copyProjectTemplateFiles(templateDirectory, projectName) {
    // return copy(opts.templateDirectory, opts.targetDirectory, {
    //     clobber: false
    // })
    
    // read all files from template folder
    const filesToCreate = fs.readdirSync(templateDirectory);
    // loop each file/folder
    filesToCreate.forEach(file => {
        const origFilePath = path.join(templateDirectory, file);

        // get stats of current file
        const stats = fs.statSync(origFilePath);

        // skip files that should not be copied
        if (SKIP_FILES.indexOf(file) > -1) return;

        if (stats.isFile()) {
            // read file content
            let content = fs.readFileSync(origFilePath, 'utf-8');
            content = render(content, {projectName});
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
            copyProjectTemplateFiles(path.join(templateDirectory, file), path.join(projectName, file));
        }
    })
}

async function initializeGit(opts) {
    const result = await execa("git", ["init"], {
        cwd: opts.targetDirectory
    })    

    if (result.failed) {
        console.error(chalk.red("Failed to initialize git"));
        return Promise.reject(
            new Error(`Failed to initialize git: ${result.stderr}`)
        );
        process.exit(1);
    }

    return;
}

export async function templateGrabber(opts) {
    opts = {
        ...opts,
        targetDirectory: opts.targetDirectory || process.cwd()
    }

    const fullPath = new URL(import.meta.url).pathname;
    let templateDir = path.resolve(
        fullPath.substr(fullPath.indexOf('/')),
        "../../projectTemplates",
        opts.template.toLowerCase()
    )

    templateDir = templateDir.substring(3);
    console.log('tempDir', templateDir);
    // console.log('CONTENT', await fs.readFileSync(path.join(opts.targetDirectory, 'react-temp', 'package.json')));
    opts.templateDirectory = templateDir;

    try {
        await access(templateDir, fs.constants.R_OK)
    } catch (error) {
        console.log(chalk.red(`Template directory ${templateDir} does not exist.`))
        console.log(error);
        process.exit(1);
    }

    // console.log('Copying project files...');
    // await copyProjectTemplateFiles(opts);

    const runningTask = new Listr([
        {
            title: "Creating project...",
            task: async () => await createDirectory(opts)
        },
        {
            title: "Hey Hold on. Copying files...",
            task: async () => await copyProjectTemplateFiles(opts.templateDirectory, opts.projectName)
        },
        {
            title: "Please wait!! Initializing Git repository in project...",
            task: async () => await initializeGit(opts),
            enabled: () => opts.git,
        },
        {
            title: "We are almost there!! Installing dependencies...",
            task: async () => await projectInstall({
                cwd: path.join(opts.targetDirectory, opts.projectName)
            }),
            skip: () => !opts.runInstall ? "--install to install all dependencies" : undefined,
        },
    ]);

    runningTask.run()

    console.log(chalk.green(`Creating project from template ${opts.template}`))
    return true;
}