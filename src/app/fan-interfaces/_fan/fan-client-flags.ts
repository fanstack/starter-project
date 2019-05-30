
/**
 * Optional flags that may be exported in an action and used by the shimmer to alter how the
 * action will be called. Recommend making the flags opt-in so lack of a flag being set, the
 * false condition, will implement the default functionality.
 */
export interface FanClientFlags {

	/**
	 * Whether or not a user must have been authenticated with Firebase in order to call
	 * this function. You can use FirebaseUI or AngularFire for easy auth support.
	 */
	authNotNeeded?: boolean,

	/**
	 * If true, and there is a call that was made before that hasn't completed, then that
	 * call will be aborted before calling again.
	 */
	abortPendingCall?: boolean,

	/**
	 * If true, the PageSpinner service will not trigger a full page spinner during this call.
	 * Use this for inline lookups such as validating a zip code or checking if a username is
	 * already in use.
	 */
	noPageSpinner?: boolean,
}