import * as firebase from 'firebase-admin';
import { FirebaseUser } from './firebase-user';
import { SqlContext } from '../sql/sql-context';

/**
 * Per the Express documentation, the middleware passes it's results
 * along through the res.locals property. That property is untyped.
 * The shim generator casts the res.locals object to this interface
 * so the middleware results are available in inside the actions in
 * typed fashion.
 * 
 * You can add additional Express middleware and put the results
 * into res.locals.  Add to this interface to access the results
 * in your FAN actions in a typesafe manner. For example, you can
 * read a user table in CloudSql or a user doc in Firestore and
 * place the userId or permission flags here.
 */
export interface FanActionContext {
	firebaseApp: firebase.app.App;
	firebaseUser: FirebaseUser;
	sessionId: number,
	sql: SqlContext,
}