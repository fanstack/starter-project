import { Request, Response } from 'express';
import { FanActionContext } from './fan-action-context';
import { FanServerFlags } from '@fan-interfaces';
import { environment } from '../../environments/environment';
import chalk from 'chalk';

export function fanActionRunner<IN, OUT>(
	action: (payload: IN, ctx: FanActionContext) => Promise<OUT>, flags: FanServerFlags = {}) {

	return async (req: Request, res: Response) => {

		let log = getLogger(environment.name == 'LOCALHOST');

		try {
			let ctx = <FanActionContext>res.locals;
			let { sessionId } = ctx;

			if (!sessionId && !flags.allowNoSession) throw new Error(`${req.originalUrl} called without a sessionId.`);
			
			let payload: OUT = await action(req.body.payload || {}, ctx);
			
			res.status(200).json({ sessionId, payload });

			log(req.url);
		}
		catch (error) {
			log(req.url, error);
			res.status(500).send(error.message);
		}
	};
}

const getLogger = (logOutput: boolean) => {

	let startTime = (new Date()).getTime();

	return (url: string, err?: any) => {

		if (logOutput) {
			let elapsed = (new Date()).getTime() - startTime;
			let e = `${elapsed.toLocaleString()}ms`;
			if (elapsed > 2000) e = chalk.red(e);
			else if (elapsed > 500) e = chalk.yellow(e);

			let s = 'succeeded';
			if (err) s = chalk.red('FAILED');

			let t = (new Date()).toLocaleTimeString();

			let msg: string[] = [t, 'FUNC', url, s, 'in', e];

			let m = msg.join(' ');
			console.log(m);

			if (err) console.log(err);
		}
	}
}