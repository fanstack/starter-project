import * as mysql from 'mysql';
import { environment } from '../../environments/environment';

export type SqlQueryFunction = (statement: string | string[], valuesArray?: any[]) => Promise<any>;

export interface SqlTransaction {
	query: SqlQueryFunction,
}

/**
 * An object that manages a MySql connection pool, suitable for resuse with Firebase functions.
 */
export class SqlContext implements SqlTransaction {
	pool: mysql.Pool;
	query: SqlQueryFunction;

	constructor(config: any) {
		this.pool = mysql.createPool(config)
		this.query = this.queryRunner(this.pool);
	}

	async transaction<T>(action: (sql: SqlTransaction) => Promise<T>, sql: SqlContext) {
		let cnx = await sql.getConnection();

		try {
			await sql.beginTransaction(cnx);
			const result = await action({ query: this.queryRunner(cnx) });
			await sql.commitTransaction(cnx);
			return result;
		}
		catch (error) {
			await sql.rollbackTransaction(cnx);
			throw error;
		}
		finally {
			cnx.release();
		}
	}

	getConnection(): Promise<mysql.PoolConnection> {
		return new Promise((resolve, reject) => {
			this.pool.getConnection((error, cnx) => {
				if (error) reject(error);
				else resolve(cnx);
			})
		});
	}

	beginTransaction(cnx: mysql.PoolConnection) {
		return new Promise((resolve, reject) => {
			cnx.beginTransaction(error => {
				if (error) reject(error);
				else resolve();
			})
		});
	}

	rollbackTransaction(cnx: mysql.PoolConnection) {
		return new Promise((resolve, reject) => {
			cnx.rollback(() => { resolve(); });
		});
	}

	commitTransaction(cnx: mysql.PoolConnection) {
		return new Promise((resolve, reject) => {
			cnx.commit(error => {
				if (error) {
					cnx.rollback(() => { reject(error); });
				}
				else resolve();
			});
		});
	}

	queryRunner(q: { query: mysql.QueryFunction }) {
		return (statement: string | string[], valuesArray: any): Promise<any> => {
			let s: string;

			if (statement instanceof Array) s = statement.join(' ');
			else s = statement;

			const sql = mysql.format(s + ';', valuesArray);

			return new Promise((resolve, reject) => {

				let d = (new Date()).getTime();

				q.query(sql, (error, results, fields) => {
					if (error) {
						let dd = (new Date()).getTime();
						console.warn(`\n[${(dd - d).toLocaleString()}ms] ${sql}\n`);
						console.error(error);
						reject(error);
					}
					else {
						if (environment.name == 'LOCALHOST') {
							//let dd = (new Date()).getTime();
							//console.log(`\n[${(dd - d).toLocaleString()}ms] ${sql}\n`);
						}
						resolve(results);
					}
				});
			});
		}
	}
}