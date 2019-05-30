import { Component, NgZone } from '@angular/core';
import { Show, Person, FanError, FAN_NO_ERROR } from '@fan-interfaces';
import { FanAuthService, FanPageSpinnerService, FanErrorService } from '@fan-services';
import { FanFunctionsService } from '@fan-services/functions';
import { combineLatest } from 'rxjs';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {

	public user = { signedIn: false, name: '', photoURL: '', sessionId: '', };
	public fanError: FanError = FAN_NO_ERROR;

	//
	// Demo fields
	//
	public person: Person = { personId: 0, first: '', last: '', favoriteShow: Show.Marvel, }
	public delay: number = 0;
	public hello: string = '';
	public people: Person[] = [];

	constructor(
		public auth: FanAuthService,
		private func: FanFunctionsService,
		public error: FanErrorService,
		zone: NgZone) {

		combineLatest(auth.firebaseUser$, error.details$).subscribe(([user, fanError]) => {
			zone.run(() => {
				this.user = user
					? { signedIn: true, name: user.displayName, photoURL: user.photoURL, sessionId: func.getSessionId().toString(16), }
					: { signedIn: false, name: '', photoURL: '', sessionId: '', };

				this.fanError = fanError;
			});
		});
	}

	public async sayHello() {
		this.error.clearError();
		const person = this.person;
		const delay = this.delay;
		this.hello = '';
		this.hello = await this.func.example.sayHello({ person, delay });
	}

	public async goBoom() {
		this.error.clearError();
		await this.func.example.doNothingButThrowAnError();
	}

	public async readPeople() {
		this.error.clearError();
		this.people = await this.func.example.sql.getPeople();
	}

}
