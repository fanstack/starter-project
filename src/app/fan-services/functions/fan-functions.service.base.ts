import { environment } from '../../../environments/environment';
import { FanErrorService, FanPageSpinnerService } from '@fan-services';
import { FanActionResult, FanClientFlags } from '@fan-interfaces';
import * as firebase from 'firebase/app';

/**
 * This is the base class for the function shims.  Each shim uses the base
 * _call function which makes the remote call and implements any client flag
 * functionality.  To add additional client flags, add them to FanClientFlags
 * interface and add implementation here.
 */
export class FanFunctionsServiceBase {

	constructor(private es: FanErrorService, private ps: FanPageSpinnerService) {
	}

	/**
	 * Shim call with no payload.  If the action function has a payload of void, null or undefined
	 * then this shim call will be used instead and the shim will not take a parameter.
	 */
	protected _callNoPayload = <OUT>(path: string, flags: FanClientFlags = {}): () => Promise<OUT> => {
		let call = this._call<void, OUT>(path, flags);
		return () => call(undefined);
	}

	/**
	 * Shim call with a payload.  The shim will have a single parameter of type IN. The type can
	 * be a JSON object with properties and those values can be accessed through destructuring.
	 */
	protected _call = <IN, OUT>(path: string, flags: FanClientFlags = {}): (payload: IN) => Promise<OUT> => {

		// Remember the last request, which may or may not still be pending, so we can
		// abort it if the abortPendingCalls client flag is set.
		let lastReq: XMLHttpRequest = undefined;

		// Whether or not a user must have been authenticated with Firebase in order to call this
		// function. You can use FirebaseUI or AngularFire for easy auth support.
		let requiresAuth = !flags.authNotNeeded;

		// Whether or not to abort a prior call that has not yet completed.  Note that this won't stop
		// the function from executing on the server, but will instruct the client to stop waiting for
		// the results and free up resources. You should always make your functions idempotent.
		let abortPendingCall = !!flags.abortPendingCall;

		// Whether or not to use the FAN Page Spinner service to show/hide a page wide spinner
		// while the call is pending/completed.  You implement the page spinner by listening to
		// the boolean observable on the service and showing a spinner when true.
		let spin = !flags.noPageSpinner;

		return async <IN, OUT>(payload: IN): Promise<OUT> => {

			const _handleError = (reject, activity: string, error: string, errorName: string = undefined) => {
				console.error(error);

				this.es.setError(activity, error, errorName, path, payload);
				if (reject) reject(errorName);
			}

			let authToken = undefined;
			if (requiresAuth) {
				console.log(firebase);
				const firebaseUser: firebase.User = firebase.auth().currentUser;
				if (!firebaseUser) {
					_handleError(undefined, 'Function Auth Error', 'Attempted to call a function that requires auth but not logged in to Firebase.');
					return Promise.reject('Function Auth Error');
				}
				authToken = await firebaseUser.getIdToken();
			}

			try {
				const url = environment.firebase.functionUrl + path;
				let message = Object.assign({}, { payload }, { sessionId: this.getSessionId() });

				return new Promise<OUT>((resolve, reject) => {

					// Using XMLHttpRequest instead of Angular's httpClient so we can easily
					// abort a prior, still pending call if there is a client flag to do so.
					let req = new XMLHttpRequest();

					req.onload = () => {
						if (lastReq == req) lastReq = undefined;
						if (spin) this.ps.turnOff();

						if (req.status === 200) {
							try {
								let response = <FanActionResult<OUT>>JSON.parse(req.responseText);

								// Some functions are flagged with allowNoSession so no session will be passed in and
								// a sessionId of undefined will be returned. In that case, we don't set the session id.
								if (response.sessionId !== undefined) this.setSessionId(response.sessionId);
								resolve(response.payload);
							}
							catch (error) {
								_handleError(reject, 'Function Response Handling Error', error.message)
							}
						} else {
							_handleError(reject, 'Function Response Handling Error', req.responseText, 'HTTP ' + req.status);
						}
					};

					req.onerror = () => {
						if (lastReq == req) lastReq = undefined;
						if (spin) this.ps.forceOff();

						_handleError(reject, 'Network Error', url, 'Failed to Connect')
					};

					req.onabort = () => {
						if (lastReq == req) lastReq = undefined;
						if (spin) this.ps.turnOff();

						console.log('Aborted call to ' + path);
						resolve(undefined);
					}

					req.open('POST', url, true);
					req.setRequestHeader("Content-Type", "application/json");

					if (requiresAuth) {
						req.setRequestHeader('Authorization', 'Bearer ' + authToken);
					}

					if (lastReq && abortPendingCall) {
						console.warn(`Aborting prior call to ${path} before making another.`);
						lastReq.abort();
					}
					lastReq = req;

					if (spin) this.ps.turnOn();
					req.send(JSON.stringify(message));
				});
			}
			catch (error) {
				_handleError(undefined, 'Function Preparation Error', error.message);
				return Promise.reject('Error preparing call to Function Service');
			}
		}
	}


	/**
	 * Simple implementation for retrieving a current sessionId.  The concept of a 'session' is
	 * specific to your app. Either refactor this stuff out or create and use a SessionService
	 * and delegate to it.
	 */
	public getSessionId: () => number = () => {
		return +(sessionStorage.getItem('APP-SESSION-ID') || '0')
	};

	/**
	 * Simple implementation for storing a current sessionId.  The concept of a 'session' is
	 * specific to your app. Either refactor this stuff out or create and use a SessionService
	 * and delegate to it.
	 */
	private setSessionId: (sessionId: number) => void = (sessionId) => {
		sessionStorage.setItem('APP-SESSION-ID', sessionId.toString());
	};
}