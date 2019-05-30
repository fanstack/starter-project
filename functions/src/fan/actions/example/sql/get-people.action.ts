import { FanActionContext } from '../../../shim/fan-action-context';
import { FanClientFlags, FanServerFlags, Person, Show } from '@fan-interfaces';

export const clientFlags: FanClientFlags = {};
export const serverFlags: FanServerFlags = {};

export const action = async (payload: undefined, { sql }: FanActionContext): Promise<Person[]> => {

	const q = [`
		SELECT personId, first, last, show
		FROM people
		ORDER BY personId
	`];

	const results = await sql.query(q);

	const people: Person[] = [...results].map(r => {
		return {
			personId: r.personId,
			first: r.first,
			last: r.last,
			favoriteShow: r.show as Show,
		}
	});

	// const people: Person[] = [
	// 	{ personId: 1, first: 'Clark', last: 'Kent', favoriteShow: Show.DC, },
	// 	{ personId: 2, first: 'Tony', last: 'Stark', favoriteShow: Show.Marvel, },
	// 	{ personId: 3, first: 'James', last: 'Kirk', favoriteShow: Show.StarTrek, },
	// 	{ personId: 4, first: 'Luke', last: 'Skywalker', favoriteShow: Show.StarWars, },
	// ];

	return people;
};
