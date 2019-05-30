export interface FanError {
	error: boolean;
	activity?: string;
	name?: string,
	message?: string;
	stack?: string;
	path?: string,
	payload?: any,
}

export const FAN_NO_ERROR: FanError = { error: false };