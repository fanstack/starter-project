const fs = require('fs');
const path = require('path');
const glob = require("glob");
const chalk = require('chalk');

/**
 * This Node script will copy the FAN specific source files to another project. This is useful
 * when you have an existing project and want to apply FAN or to build a fresh project with a
 * brand new Angular project, rather than just updating the dependencies in this one.
 * 
 * Note that this script simply copies the relevant files on top of any pre-existing ones. If
 * you would like to merge changes in, you should ensure the destination project is in Git and
 * then use source control merging to keep what you want.
 *
 * To use this script, pass in the path to the destination project, absolute or relative to
 * this project.
 * 
 * > node overlay-fan ../another-project
 * 
 */

const showErrorAndExit = (error) => {
	console.error(`\n${chalk.red('ERROR: ' + error)}\n`);
	process.exit(1);
}

try {
	console.log(chalk.blue('\n------------------------\n      Overlay FAN\n------------------------\n'));

	if (process.argv.length < 3) showErrorAndExit(`Path to destination project not provided.`);
	process.chdir(__dirname);

	const src = __dirname;
	const dst = path.normalize(path.resolve(process.argv[2]));

	console.log(`Source: ${src}`);
	console.log(`Dest:   ${dst}`);

	const srcStats = fs.statSync(src);
	const dstStats = fs.statSync(dst);

	if (srcStats.dev == dstStats.dev && srcStats.ino == dstStats.ino) {
		showErrorAndExit('Source and destination projects are the same.');
	}

	//
	// Check that the destination is a properly configured angular and firebase project
	//
	const expectedDestFiles = [
		'angular.json',
		'firebase.json',
		'package.json',
		'tsconfig.json',
		'src/index.html',
		'src/environments/environment.ts',
		'src/app/app.component.ts',
		'src/app/app.module.ts',
		'functions/package.json',
		'functions/tsconfig.json',
		'functions/src/index.ts',
	];

	console.log(chalk.blue(`\nChecking destination project has expected files.`));
	for (let f of expectedDestFiles) {
		const destFile = path.join(dst, './' + f);
		if (fs.existsSync(destFile)) console.log(`${chalk.green(' + ')}${f}`);
		else showErrorAndExit(`Missing: ${f}`);
	}


	const filePatterns = [
		'.gitignore',
		'angular.json',
		'package.json',
		'package-lock.json',
		'tsconfig.json',
		'.vscode/launch.json',
		'functions/package.json',
		'functions/package-lock.json',
		'functions/tsconfig.json',
		'functions/src/**',
		'src/main.ts',
		'src/styles.scss',
		'src/environments/environment.ts',
		'src/environments/environment.dev.ts',
		'src/environments/environment.prod.ts',
		'src/app/app.component.html',
		'src/app/app.component.scss',
		'src/app/app.component.ts',
		'src/app/app.module.ts',
		'src/app/fan-interfaces/**',
		'src/app/fan-services/**',
		'src/app/fan-widgets/**',
		'overlay-fan.js',
		'README.md',
		'LICENSE',
	];

	console.log(chalk.blue(`\nCopying files.`));

	// First, check all patterns are good
	for (let p of filePatterns) {
		const files = glob.sync(p, { nodir: true });
		if (files.length == 0) showErrorAndExit(`No source files matching pattern ${p}`);
	}

	// Next, copy all the files
	let count = 0;
	for (let p of filePatterns) {
		const files = glob.sync(p, { nodir: true });
		for (let f of files) {
			const s = path.join(src, './' + f);
			const d = path.join(dst, './' + f);
			const dir = path.dirname(d);
			if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
			fs.copyFileSync(s, d);
			console.log(`${chalk.green(' + ')}${f}`);
			count++;
		}
	}

	console.log(chalk.green(`\n${count} files successfully copied.\n`));
}
catch (e) {
	console.error(e);
	showErrorAndExit(e);
}