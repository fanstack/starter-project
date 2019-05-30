/**
 * The complete response from the server, including the function return value (payload).
 * Alter the generator (fan_action_generator.js) to add any extra information, such
 * as an app specific user id. An app specific session_id is returned as an example. 
 */
export interface FanActionResult<OUT> {
	payload?: OUT,
	sessionId: number,
}