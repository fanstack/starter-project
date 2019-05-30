export interface FirebaseUser {
	email: string,
	emailVerified: boolean,
	expires: number,
	signinProvider: string,
	displayName: string,
	photoLink: string,
	userId: string,
}