import { FanActionContext } from '../../shim/fan-action-context';
import { FanClientFlags, FanServerFlags, Person } from '@fan-interfaces';

//
// By convention, you may want to place helper functions in a ./support folder
//
import { getGreeting } from './support/get-greeting';
import { timeout } from './support/timeout';

export const clientFlags: FanClientFlags = {};
export const serverFlags: FanServerFlags = {};

export const action = async (payload: { person: Person, delay: number }, { }: FanActionContext): Promise<string> => {

	let { person, delay } = payload;

	if (delay > 0) await timeout(delay);
	let greeting = getGreeting(person.favoriteShow);

	let personalized = '';
	if (person && person.first) personalized = `, ${person.first}`;

	return `${greeting}${personalized}`;
};
