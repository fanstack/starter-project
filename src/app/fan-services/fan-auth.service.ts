import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { supportsLocalStorage } from './support/supports-web-storage';
import { FanPageSpinnerService } from '@fan-services';
import { FanFunctionsService } from './functions';


const PERSISTENCE = firebase.auth.Auth.Persistence.NONE;

/**
 * This auth service wraps the setup of AngularFire auth.  While Firebase supports
 * several auth providers, we only show Google here so that we can use Google scopes
 * and access Google's cloud services. e.g. Calendar.  Alternatively, you could add
 * a parameter to signIn() and use alternate providers. If you choose to do this,
 * consider switching to https://github.com/firebase/firebaseui-web. Also, if you
 * will be using a Google Access token, you may want to use GAPI directly to refresh
 * the Access Tokens.
 */
@Injectable({ providedIn: 'root' })
export class FanAuthService {

	private signingOut = false;

	//
	// The firebase user object or undefined depending if signed in or not 
	//
	private readonly firebaseUser = new BehaviorSubject<firebase.User | undefined>(undefined);
	public readonly firebaseUser$ = this.firebaseUser.pipe(distinctUntilChanged(this.userComparer));

	//
	// The accessToken observable can be used when persistence is set to NONE.  Otherwise,
	// the token needs to be passed to a function when first received and persisted until
	// it has expired.
	//
	private readonly accessToken = new BehaviorSubject<string | undefined>(undefined);
	public readonly accessToken$ = this.accessToken.pipe(distinctUntilChanged());

	//
	// If you do wish to use persistence, you can check if the browser supports it
	//
	public readonly supportsLocalStorage = supportsLocalStorage();


	constructor(
		private afAuth: AngularFireAuth,
		private spinner: FanPageSpinnerService,
		private func: FanFunctionsService,
	) {

		this.spinner.turnOn();

		//
		// Firebase auth can remember a user that signed in and automatically sign them in again.
		// The default persistence is SESSION.
		//
		afAuth.auth.setPersistence(PERSISTENCE);

		//
		// Every time the Id Token changes, call a function. The Id Token represents WHO is logged
		// in. This is a Firebase concept (e.g. referring to a Firebase UID).  The Id Token expires
		// after an hour or so but Firebase Auth provides a Refresh Token.  When you make a call to
		// firebase.auth().currentUser.getIdToken() it will automatically use the Refresh Token to
		// get a newly minted Id Token for you. FAN Stack passes the Id Token to the functions for
		// you, verifies it is valid, and let's you know about the signed in user.
		//
		// By the way, don't confuse the Id Token (WHO the user is) with an Access Token (WHAT the
		// user can do).  The Access Token is specific to the auth provider (e.g you get an Access
		// Token from the Google Provider to access things like Calendar, Mail, Drive on behalf of
		// user).
		//
		afAuth.auth.onIdTokenChanged(this.onIdTokenChanged.bind(this));
	}


	/**
	 * Sign in to Firebase using the Google Provider. IMPORTANT, you must enable the Google sign
	 * in method in the Firebase Console for your project or this will fail.  Signing in through
	 * the redirect flow causes the browser to open other pages to select a Google User and then
	 * consent to requested scopes, if provided. Redirect is better than popup for mobile devices.
	 * The onIdTokenChanged() method will be triggered upon return to this app.
	 */
	public async signIn() {

		this.spinner.turnOn();
		if (this.firebaseUser.value) this.signOut();

		// You can add as many Google scopes as you wish. Be sure to enable the APIs in the Google
		// developers console.  https://console.developers.google.com/apis/library

		let provider = new firebase.auth.GoogleAuthProvider();
		// provider.addScope('https://www.googleapis.com/auth/calendar.readonly'); // to read their calendar
		// provider.addScope('https://www.googleapis.com/auth/gmail.readonly');    // to read their email
		// provider.addScope('https://www.googleapis.com/auth/drive.readonly');    // to read their drive
		await this.afAuth.auth.signInWithRedirect(provider);
	}


	/**
	 * Tell Firebase to sign out.  The onIdTokenChanged() method will then be triggered.
	 */
	public async signOut() {
		this.spinner.turnOn();
		this.signingOut = true;
		await this.afAuth.auth.signOut();
	}


	/**
	 * This method will be called every time the Id Token changes.
	 * @param user If Persistence.LOCAL or Persistence.SESSION was used, this may be the last User that was automatically signed in again.
	 */
	private async onIdTokenChanged(user: firebase.User) {

		try {

			//
			// If there is persistence, a user object may be passed in.
			// The default persistence is SESSION.
			// To change it, in the constructor, call afAuth.auth.setPersistence(...); 
			//
			this.firebaseUser.next(user || undefined);

			if (!this.signingOut) {

				//
				// Get the redirect result if this was after a redirect.  This might throw an error as described 
				// at https://firebase.google.com/docs/reference/js/firebase.auth.Auth.html#getredirectresult
				//
				let redirect = await this.afAuth.auth.getRedirectResult();

				if (redirect) {

					this.firebaseUser.next(redirect.user || undefined);

					if (redirect.credential) {
						//
						// Right after a redirect through the Google Auth sign in and consent screens, getRedirectResults()
						// can be called.  If successful, the redirect object will have an accessToken that can be used to
						// call Google services, such as Calendar, Mail, and Drive, on behalf of the user. You can use the
						// Access Token locally or pass it to a function to store for use during the session (e.g. Firestore)

						// If you use Persistence, you will need to manually persist the Access Token such as by passing it
						// to a cloud function and storing it in a database. Alternatively, you can use Persistence.NONE and
						// force the user to re-signin and consent each time they open your app. You will then have a fresh
						// Access Token that you can keep in browser memory.
						//
						// Unfortunately, Firebase Auth discards the Access Refresh Token. When the Access token expires,
						// it cannot be renewed using Firebase Auth. You will need to have the user login and go through the
						// consent screen again, every hour when the token expires.  Don't confuse the Refresh Token that is
						// available for the Id Token with the one for the Access Token. They are not the same thing. There
						// is currently no way to refresh the Access Token using Firebase Auth.
						//
						// If having the user sign in and consent that often is not acceptable, you can choose to use GAPI
						// instead.  GAPI will log you into Google Auth and provide credentials. You can then log into
						// Firebase Auth using those credentials by changing signIn() and having it instead call
						// this.afAuth.auth.signInAndRetrieveDataWithCredential().  See these links for details:
						//
						//
						// https://stackoverflow.com/questions/49929134/how-to-get-refresh-token-for-google-api-using-firebase-authentication
						//
						this.accessToken.next(redirect.credential['accessToken']);

						//
						// After a new sign in, start a new session
						//
						this.func.session.start();
					}
				}
			}

			this.signingOut = false;

			if (!this.firebaseUser.value) this.accessToken.next(undefined);
		}
		catch (error) {
			console.error(error);
			this.accessToken.next(undefined);
			this.firebaseUser.next(undefined);
		}

		this.spinner.forceOff();
	}

	private userComparer(u1: firebase.User | undefined, u2: firebase.User | undefined) {
		if (u1 == u2) return true;
		if (u1 == undefined || u2 == undefined) return false;
		if (u1.uid !== u2.uid) return false;
		if (u1.displayName !== u2.displayName) return false;
		return true;
	}

}