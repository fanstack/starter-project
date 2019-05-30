import { Show } from '@fan-interfaces';

export function getGreeting(show: Show) {
	if (show == Show.DC) return 'Up, up and away';
	if (show == Show.Marvel) return 'Assemble';
	if (show == Show.StarTrek) return 'Live long and prosper';
	if (show == Show.StarWars) return 'May the force be with you';
	else return 'Hello';
}