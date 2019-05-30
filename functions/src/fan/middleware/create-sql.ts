
import { Request, Response, NextFunction } from 'express';
import { FanActionContext } from '../shim/fan-action-context';
import { SqlContext } from '../sql/sql-context';
import { environment } from '../../environments/environment';

let sql: SqlContext;  // MUST be outside the function!

/**
 * Instantiate a SQL Connection Pool and place it in the FanActionContext so it
 * will be available in each of the action functions.
 * @param req
 * @param res
 * @param next
 */
export function createSql(req: Request, res: Response, next: NextFunction) {

	let locals = <FanActionContext>res.locals;
	sql = sql || new SqlContext(environment.sql);
	locals.sql = sql;

	next();
};