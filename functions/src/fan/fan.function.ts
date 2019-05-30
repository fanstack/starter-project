//
// Express imports
//
import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';

//
// Custom Middleware
//
import {
	restrictToPost,
	initFirebase,
	authenticateUser,
	createSql,
	checkSession,
	logActivity,
} from './middleware';


//
// Add all the generated action functions
//
import { setupActions } from './shim/fan-actions.gen';

/**
 * Create an Express.js app that processes requests
 * and runs the requested action
 * @param urlPrefix 
 */
export function fanFunction(urlPrefix: string) {

	const app = express(); 				// https://expressjs.com/
	app.use(cors({ origin: true })); 	// Cross-Origin Resource Sharing
	app.use(restrictToPost); 			// Bail if the HTTP Verb is not POST
	app.use(bodyParser.json()); 		// Posted content will always be JSON
	app.use(initFirebase);				// Initialize Firebase
	app.use(authenticateUser);
	app.use(logActivity);
	app.use(createSql);
	app.use(checkSession);

	setupActions(app, urlPrefix);

	return app;
}