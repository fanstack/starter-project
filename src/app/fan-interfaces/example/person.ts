import { Show } from '@fan-interfaces';

/**
 * This is an example interface of a Person which is available in the Angular App and the Functions.
 */
export interface Person {
	personId: number,
	first: string,
	last: string,
	favoriteShow: Show,
}