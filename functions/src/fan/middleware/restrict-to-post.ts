import { Request, Response, NextFunction } from 'express';

/**
 * Only allow HTTP POST verbs.
 * @param req
 * @param res
 * @param next
 */
export function restrictToPost(req: Request, res: Response, next: NextFunction) {

	if (req.method !== 'POST') {
		res.status(404).send('Not Found');
		return;
	}
	else next();
};