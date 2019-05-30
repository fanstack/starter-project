import { FanActionContext } from '../../shim/fan-action-context';
import { FanClientFlags, FanServerFlags } from '@fan-interfaces';

export const clientFlags: FanClientFlags = {};
export const serverFlags: FanServerFlags = {};

/**
 * Throw a function to demonstrate how it is caught and displayed in the client.
 * @param payload Use undefined to take no parameter
 */
export const action = async (payload: undefined, { }: FanActionContext): Promise<void> => {

	throw new Error('Boom!');
};
