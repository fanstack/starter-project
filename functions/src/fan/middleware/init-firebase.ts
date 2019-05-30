
import { Request, Response, NextFunction } from 'express';
import { FanActionContext } from '../shim/fan-action-context';
import { environment } from '../../environments/environment';
import * as firebase from 'firebase-admin';

let app: firebase.app.App;   // MUST be outside the function!
let envName = environment.name;
let serviceAccountKey = environment.firebase.admin.serviceAccountKey;
let firebaseConfig = environment.firebase.config;


/**
 * Initialize the Firebase app using the standard config parameters from the Firebase
 * console along with the Firebase Admin's service account key.
 * @param req
 * @param res
 * @param next
 */
export function initFirebase(req: Request, res: Response, next: NextFunction) {

	let locals = <FanActionContext>res.locals;

	if (app == undefined) {
		if (envName == 'LOCALHOST') {

			app = firebase.initializeApp({
				credential: firebase.credential.cert(<any>serviceAccountKey),
				databaseURL: firebaseConfig.databaseURL,
				storageBucket: firebaseConfig.storageBucket,
				projectId: firebaseConfig.projectId,
			});
		}
		else app = firebase.initializeApp();
	}

	locals.firebaseApp = app;

	next();
};