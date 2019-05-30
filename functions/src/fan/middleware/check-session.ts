
import { Request, Response, NextFunction } from 'express';
import { FanActionContext } from '../shim/fan-action-context';

/**
 * The concept of a session will differ from app to app. This middleware is a
 * placeholder where you can implement your own session logic.  For now, it just
 * uses a random number for the sessionId and doesn't check if it is valid.
 * @param req
 * @param res
 * @param next
 */
export async function checkSession(req: Request, res: Response, next: NextFunction) {

	try {
		let locals = <FanActionContext>res.locals;
		// let user = locals.firebaseUser;
		// let sql = locals.sql;

		if (req.originalUrl.endsWith('session_start')) {

			// TODO: Implement your own session start logic, such as inserting a record
			// into a Session table in a database with the current user and time and then
			// using the row key as the sessionId.
			//
			// Just generating a random sessionId for now.

			locals.sessionId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
		}
		else {
			locals.sessionId = +req.body.sessionId;

			// TODO: Implement your own logic to check that the sessionId is still valid
			// for the current user and perhaps create a new session if the last one has
			// timed out.
			//
			// Consider throwing an error if the sessionId is bogus.
		}

		next();
	}
	catch (error) {
		console.error(error);
		res.status(500).send(error.message);
	}
};