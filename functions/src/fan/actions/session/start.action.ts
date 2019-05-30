import { FanActionContext } from '../../shim/fan-action-context';
import { FanServerFlags } from '@fan-interfaces';

export const serverFlags: FanServerFlags = { allowNoSession: true };

export const action = async (payload: void, { sessionId, firebaseUser, sql }: FanActionContext): Promise<boolean> => {

	// What does it mean in your app to start a session?
	// Put your own custom session start logic here.

	return !!sessionId;
};
