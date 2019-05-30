
import { Request, Response, NextFunction } from 'express';
import { FanActionContext } from '../shim/fan-action-context';


/**
 * Middleware that logs each action call and the Firebase user that made the call. 
 * @param req
 * @param res
 * @param next
 */
export async function logActivity(req: Request, res: Response, next: NextFunction) {

	try {
		let locals = <FanActionContext>res.locals;
		let url = req.originalUrl;

		console.info(`${url} called by ${locals.firebaseUser.displayName} (${locals.firebaseUser.email})`);
		next();
	
	}
	catch (e) {
		console.error(e);
		res.status(500).send(`Error: ${e.message}`);
	}
}