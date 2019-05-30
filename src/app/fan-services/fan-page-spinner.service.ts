import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class FanPageSpinnerService {

	private count = 0;
	private readonly spinning = new BehaviorSubject<boolean>(false);
	public readonly spinning$ = this.spinning.pipe(distinctUntilChanged());

	/**
	 * Increment the spinner request count. The spinner will spin until the count is decremented with turnOff() or forceOff().
	 */
	public turnOn() {
		this.count++;
		this.spinning.next(true);
	}

	/**
	 * Decrement the spinner request count. When the count reaches zero, the spinner will start.
	 */
	public turnOff() {
		this.count--;
		if (this.count < 0) this.count = 0;
		this.spinning.next(this.count > 0);
	}

	/**
	 * Set the spinner request count to zero and force the spinner to stop.
	 */
	public forceOff() {
		this.count = 0;
		this.spinning.next(false);
	}
}