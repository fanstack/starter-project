
import { fanFunction } from './fan/fan.function';

//
// Because FAN functions are simply a Node app (with Express),
// we can just start up the Node app and debug it right within
// VS Code and use VS Code's debugging features.  A launch.json
// file is added to the .vscode folder which points to the
// compiled output of this file (/lib/debug-fan-actions.js)
//
if (module === require.main) {
	let app = fanFunction('/fan/');
	const server = app.listen(5000, () => {
		const port = server.address().port;
		console.log(`App listening on port ${port}`);
	});
}