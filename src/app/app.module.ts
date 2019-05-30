
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FanPageSpinnerWidget } from './fan-widgets';
import { environment } from '../environments/environment';

@NgModule({
	imports: [
		BrowserModule,
		AngularFireModule.initializeApp(environment.firebase.config),
		AngularFireAuthModule,
		HttpClientModule,
		FormsModule,
		AppRoutingModule,
	],
	providers: [],
	declarations: [
		AppComponent,
		FanPageSpinnerWidget,
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
