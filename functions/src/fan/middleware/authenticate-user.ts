
import { Request, Response, NextFunction } from 'express';
import { FanActionContext } from '../shim/fan-action-context';
import { FirebaseUser } from '../shim/firebase-user';


/**
 * Validates the user token passed from the Angular app and places the resulting
 * Firebase user object into the FanActionContext so it can be used by action functions.
 * @param req
 * @param res
 * @param next
 */
export async function authenticateUser(req: Request, res: Response, next: NextFunction) {

	try {
		let locals = <FanActionContext>res.locals;
		let firebaseApp = locals.firebaseApp;
		let bearer: string | undefined = undefined;
		let token: string | undefined = undefined;

		if (req.headers) bearer = <string>req.headers.authorization;
		if (bearer && bearer.startsWith('Bearer ')) token = bearer.split('Bearer ')[1];

		if (token) {
			let user = await firebaseApp.auth().verifyIdToken(token);
			let firebaseUser: FirebaseUser = {
				email: user.email,
				emailVerified: user.email_verified,
				expires: user.exp,
				signinProvider: user.firebase.sign_in_provider,
				displayName: user.name,
				photoLink: user.picture,
				userId: user.uid,
			};

			if (user.email) {
				locals.firebaseUser = firebaseUser;
				next();
				return;
			}
			else {
				res.status(500).send('Error: No Email Address');
				return;
			}
		}

		res.status(401).send('Auth Error: Unauthorized!');
	}
	catch (e) {
		console.error(e);
		res.status(401).send('Auth Error: Unauthorized');
	}
};