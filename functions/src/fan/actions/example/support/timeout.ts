/**
 * An async/await friendly version of setTimeout()
 * @param delay milliseconds
 */
export async function timeout(delay: number) {
	await new Promise(resolve => {
		setTimeout(() => resolve(), delay)
	});
}