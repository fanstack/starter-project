
import * as functions from 'firebase-functions'
import { fanFunction } from './fan/fan.function';

export const fan = functions.https.onRequest(fanFunction('/'));

// Add any other (non-fan) functions here
