/**
 * Perform a test to see if both local storage is enabled
 * and that there is enough space to store something. Some
 * versions of Safari have it enabled but set the limit to
 * 0 when using private browsing.
 */
export function supportsLocalStorage() {

	try {
		let test = 'test-for-support';
		localStorage.setItem(test, test)
		this.hasWebStorage = localStorage.getItem(test) === test;
		localStorage.removeItem(test);
	}
	catch (e) {
		return false;
	}

	return true;
}