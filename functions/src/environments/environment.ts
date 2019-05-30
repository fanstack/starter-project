export const environment = {
	name: 'LOCALHOST',
	firebase: {
		config: 'YOUR_DEV_APP_CONFIG',
		admin: {
			serviceAccountKey: 'YOUR_DEV_APP_SERVICE_ACCOUNT_KEY'
		}
	},
	sql: {
		connectionLimit: 1,
		user: 'root',
		password: 'YOUR_DEV_SQL_PASSWORD',
		database: 'YOUR_DEV_SQL_DATABASE',
		host: '127.0.0.1',  // connect through cloud-sql-proxy using default MYSQL port of 3306
		environment: 'development'
	},
};