
/**
 * Optional flags that may be exported in an action and used by the shimmer to alter how the
 * action will run on the server. Recommend making the flags opt-in so lack of a flag being
 *  set, the false condition, will implement the default functionality.
 */
export interface FanServerFlags {
	/**
	 * This action can be run even if there is not a person signed in with a session.
	 */
	allowNoSession?: boolean,
}