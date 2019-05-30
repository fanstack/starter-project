import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FanError, FAN_NO_ERROR } from '@fan-interfaces';

@Injectable({ providedIn: 'root' })
export class FanErrorService {

	private readonly details = new BehaviorSubject<FanError>(FAN_NO_ERROR);
	public readonly details$: Observable<FanError>;
	public snapshot = FAN_NO_ERROR;

	constructor() {
		this.details$ = this.details.asObservable();
	}

	setError(activity: string,
		error: Error | string,
		errorName: string,
		path: string,
		payload: any) {

		let d: FanError;

		if (error instanceof Error) {
			let name = errorName || error.name || 'Error';
			let message = error.message || 'Something bad happened';
			let stack = error.stack || '';
			d = { error: true, activity, name, message, stack, path, payload };
		}
		else {
			let name = errorName || 'Error';
			let message = error || 'Something bad happened';
			let stack = '';
			d = { error: true, activity, name, message, stack, path, payload };
		}

		this.details.next(d);
		this.snapshot = d;
	}

	clearError() {
		this.details.next(FAN_NO_ERROR);
		this.snapshot = FAN_NO_ERROR;
	}
}