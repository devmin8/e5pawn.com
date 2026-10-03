export function promptForPassword() {
	if (!process.stdin.isTTY) {
		throw new Error('A TTY is required to enter the password securely.');
	}

	return new Promise<string>((resolve, reject) => {
		let password = '';
		const stdin = process.stdin;
		const cleanup = () => {
			stdin.off('data', onData);
			stdin.setRawMode(false);
			stdin.pause();
			process.stdout.write('\n');
		};
		const onData = (data: string) => {
			for (const character of data) {
				if (character === '\r' || character === '\n') {
					cleanup();
					resolve(password);
					return;
				}
				if (character === '\u0003' || character === '\u0004') {
					cleanup();
					reject(new Error('Password prompt cancelled'));
					return;
				}
				if (character === '\u007f' || character === '\b') {
					password = password.slice(0, -1);
				} else {
					password += character;
				}
			}
		};

		stdin.setRawMode(true);
		stdin.setEncoding('utf8');
		stdin.on('data', onData);
		stdin.resume();
		process.stdout.write('Password: ');
	});
}
