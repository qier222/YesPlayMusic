const cli = {
	width: 80,
	_program: {},
	_options: [],
	program: (information = {}) => {
		cli._program = information;
		return cli;
	},
	option: (flags, addition = {}) => {
		// name or flags - Either a name or a list of option strings, e.g. foo or -f, --foo.
		// dest - The name of the attribute to be added to the object returned by parse_options().

		// nargs - The number of command-line arguments that should be consumed. // N, ?, *, +, REMAINDER
		// action - The basic type of action to be taken when this argument is encountered at the command line. // store, store_true, store_false, append, append_const, count, help, version

		// const - A constant value required by some action and nargs selections. (supporting store_const and append_const action)

		// metavar - A name for the argument in usage messages.
		// help - A brief description of what the argument does.

		// required - Whether the command-line option may be omitted (optionals only).
		// default - The value produced if the argument is absent from the command line.
		// type - The type to which the command-line argument should be converted.
		// choices - A container of the allowable values for the argument.

		flags = Array.isArray(flags) ? flags : [flags];
		addition.dest =
			addition.dest ||
			flags
				.slice(-1)[0]
				.toLowerCase()
				.replace(/^-+/, '')
				.replace(/-[a-z]/g, (character) =>
					character.slice(1).toUpperCase()
				);
		addition.help =
			addition.help ||
			{
				help: 'output usage information',
				version: 'output the version number',
			}[addition.action];
		cli._options.push(
			Object.assign(addition, {
				flags: flags,
				positional: !flags[0].startsWith('-'),
			})
		);
		return cli;
	},
	parse: (argv) => {
		const positionals = cli._options
				.map((option, index) => (option.positional ? index : null))
				.filter((index) => index !== null),
			optionals = {};
		cli._options.forEach((option, index) =>
			option.positional
				? null
				: option.flags.forEach((flag) => (optionals[flag] = index))
		);

		cli._program.name =
			cli._program.name || require('path').parse(argv[1]).base;
		const args = argv.slice(2).reduce(
			(result, part) =>
				/^-[^-]/.test(part)
					? result.concat(
							part
								.slice(1)
								.split('')
								.map((string) => '-' + string)
						)
					: result.concat(part),
			[]
		);

		let pointer = 0;
		while (pointer < args.length) {
			let value = null;
			const part = args[pointer];
			const index = part.startsWith('-')
				? optionals[part]
				: positionals.shift();
			if (index === undefined)
				part.startsWith('-')
					? error(`no such option: ${part}`)
					: error(`extra arguments found: ${part}`);
			if (part.startsWith('-')) pointer += 1;
			const { action } = cli._options[index];

			if (['help', 'version'].includes(action)) {
				if (action === 'help') help();
				else if (action === 'version') version();
			} else if (['store_true', 'store_false'].includes(action)) {
				value = action === 'store_true';
			} else {
				const gap = args
					.slice(pointer)
					.findIndex((part) => part in optionals);
				const next = gap === -1 ? args.length : pointer + gap;
				value = args.slice(pointer, next);
				if (value.length === 0) {
					if (cli._options[index].positional)
						error(`the following arguments are required: ${part}`);
					else if (cli._options[index].nargs === '+')
						error(
							`argument ${part}: expected at least one argument`
						);
					else error(`argument ${part}: expected one argument`);
				}
				if (cli._options[index].nargs !== '+') {
					value = value[0];
					pointer += 1;
				} else {
					pointer = next;
				}
			}
			cli[cli._options[index].dest] = value;
		}
		if (positionals.length)
			error(
				`the following arguments are required: ${positionals
					.map((index) => cli._options[index].flags[0])
					.join(', ')}`
			);
		// cli._options.forEach(option => console.log(option.dest, cli[option.dest]))
		return cli;
	},
};

const pad = (length) => new Array(length + 1).join(' ');

const usage = () => {
	const options = cli._options.map((option) => {
		const flag = option.flags.sort((a, b) => a.length - b.length)[0];
		const name = option.metavar || option.dest;
		if (option.positional) {
			if (option.nargs === '+') return `${name} [${name} ...]`;
			else return `${name}`;
		} else {
			if (
				['store_true', 'store_false', 'help', 'version'].includes(
					option.action
				)
			)
				return `[${flag}]`;
			else if (option.nargs === '+')
				return `[${flag} ${name} [${name} ...]]`;
			else return `[${flag} ${name}]`;
		}
	});
	const maximum = cli.width;
	const title = `usage: ${cli._program.name}`;
	const lines = [title];

	options
		.map((name) => ' ' + name)
		.forEach((option) => {
			lines[lines.length - 1].length + option.length < maximum
				? (lines[lines.length - 1] += option)
				: lines.push(pad(title.length) + option);
		});
	console.log(lines.join('\n'));
};

const help = () => {
	usage();
	const positionals = cli._options
		.filter((option) => option.positional)
		.map((option) => [option.metavar || option.dest, option.help]);
	const optionals = cli._options
		.filter((option) => !option.positional)
		.map((option) => {
			const { flags } = option;
			const name = option.metavar || option.dest;
			/** @type {string} */
			let use;
			if (
				['store_true', 'store_false', 'help', 'version'].includes(
					option.action
				)
			)
				use = flags.map((flag) => `${flag}`).join(', ');
			else if (option.nargs === '+')
				use = flags
					.map((flag) => `${flag} ${name} [${name} ...]`)
					.join(', ');
			else use = flags.map((flag) => `${flag} ${name}`).join(', ');
			return [use, option.help];
		});
	let align = Math.max.apply(
		null,
		positionals.concat(optionals).map((option) => option[0].length)
	);
	align = align > 30 ? 30 : align;
	const rest = cli.width - align - 4;
	const publish = (option) => {
		const slice = (string) =>
			Array.from(Array(Math.ceil(string.length / rest)).keys())
				.map((index) => string.slice(index * rest, (index + 1) * rest))
				.join('\n' + pad(align + 4));
		option[0].length < align
			? console.log(
					`  ${option[0]}${pad(align - option[0].length)}  ${slice(
						option[1]
					)}`
				)
			: console.log(
					`  ${option[0]}\n${pad(align + 4)}${slice(option[1])}`
				);
	};
	if (positionals.length) console.log('\npositional arguments:');
	positionals.forEach(publish);
	if (optionals.length) console.log('\noptional arguments:');
	optionals.forEach(publish);
	process.exit();
};

const version = () => {
	console.log(cli._program.version);
	process.exit();
};

const error = (message) => {
	usage();
	console.log(cli._program.name + ':', 'error:', message);
	process.exit(1);
};

module.exports = cli;
