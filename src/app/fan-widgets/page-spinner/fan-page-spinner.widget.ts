import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { FanPageSpinnerService } from '@fan-services';
import { Subscription } from 'rxjs';

@Component({
	selector: 'fan-page-spinner',
	templateUrl: './fan-page-spinner.widget.html',
	styleUrls: ['./fan-page-spinner.widget.scss']
})
export class FanPageSpinnerWidget implements OnInit, OnDestroy {

	public spinning = false;
	private subscription: Subscription;

	constructor(public spinner: FanPageSpinnerService, private zone: NgZone) {
	}

	ngOnInit() {
		this.subscription = this.spinner.spinning$.subscribe(
			spinning => this.zone.run(() => this.spinning = spinning)
		);
	}

	ngOnDestroy() {
		if (this.subscription) this.subscription.unsubscribe();
	}

}