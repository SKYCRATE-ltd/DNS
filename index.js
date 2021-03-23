#!/bin/env node

// TODO: update to use computer, zed, etc...
import {
	readFileSync,
	writeFileSync
} from "fs";

let [
	IP,
	CMD,
	...hostnames
] = process.argv.slice(2);
const RETURN = x => x;
const NEWLINE = '\n';
const SPACE = ' ';
const COMMENT = '#';
const FILE = '/etc/hosts';
const encoding = "utf-8";

const gap = (s, o = "") => {
	for (let i = 0; i < s; i++)
		o += SPACE;
	return o;
};

const parse = file =>
				readFileSync(file, {encoding})
				.split(NEWLINE)
				.map(x => x.trim())
				.filter(RETURN)
				.filter(x => !x.startsWith(COMMENT))
				.map(line => {
					let [IP, ...hostnames] = line.split(SPACE).filter(RETURN);
					return [IP, hostnames];
				});

const render_line = (IP, hostnames) => IP + gap(20 - IP.length) + hostnames.join(SPACE);
const render = hosts => hosts.map(([IP, hostnames]) => render_line(IP, hostnames)).join(NEWLINE);

const save = hosts =>
	writeFileSync(FILE, render(hosts), {encoding});

const HOSTS_FILE = parse(FILE);

const CMDS = {
	list: _ip => {
		return _ip ? HOSTS_FILE
						.filter(([ip]) => _ip === ip)
						.map(([ip, hostnames]) => hostnames.join(SPACE)).join(NEWLINE) : render(HOSTS_FILE);
	},
	add: (_ip, ...hostnames) => {
		let row = HOSTS_FILE.find(([ip]) => ip === _ip);
		
		if (!row) {
			row = [_ip, []];
			HOSTS_FILE.push(row);
		}
		row[1].push(...hostnames.filter(name => !row[1].includes(name)));

		save(HOSTS_FILE);
		return render(HOSTS_FILE);
	},
	remove: (_ip, ...hostnames) => {
		const row = HOSTS_FILE.find(([ip]) => ip === _ip);
		if (!row)
			return `ERROR: ${_ip} is not present in hosts file.`
		
		row[1] = row[1].filter(hostname => !hostnames.includes(hostname));

		const hosts = row[1].length ? HOSTS_FILE : HOSTS_FILE.filter(([ip]) => ip !== _ip);
		save(hosts);
		return render(hosts);
	},
	clear: _ip => {
		const hosts = HOSTS_FILE.filter(([ip]) => _ip !== ip);
		save(hosts);
		return render(hosts);
	}
}

if (!IP || !CMD)
	CMD = "list";

console.log(CMDS[CMD](IP, ...hostnames));