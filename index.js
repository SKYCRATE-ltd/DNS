#!/bin/env node

import {
	readlines,
	write
} from "computer";
import Program from "termite";

const RETURN = x => x;
const NEWLINE = '\n';
const SPACE = ' ';
const FILE = '/etc/hosts';

const render_gap = (s, o = "") => {
	for (let i = 0; i < s; i++)
		o += SPACE;
	return o;
};
const render_line = (IP, hostnames) => IP + render_gap(20 - IP.length) + hostnames.join(SPACE);
const render = hosts => hosts.map(([IP, hostnames]) => render_line(IP, hostnames)).join(NEWLINE);
const read = file => readlines(file)
						.map(line => {
							let [IP, ...hostnames] = line.split(SPACE).filter(RETURN);
							return [IP, hostnames];
						});
const save = hosts => write(FILE, render(hosts));

const HOSTS_FILE = read(FILE);

let [
	IP,
	CMD,
	...hostnames
] = process.argv.slice(2);

if (!IP || !CMD)
	CMD = "list";

Program({
	list(_ip) {
		return _ip ? HOSTS_FILE
						.filter(([ip]) => _ip === ip)
						.map(([ip, hostnames]) => hostnames.join(SPACE)).join(NEWLINE) : render(HOSTS_FILE);
	},
	add(_ip, ...hostnames) {
		let row = HOSTS_FILE.find(([ip]) => ip === _ip);
		
		if (!row) {
			row = [_ip, []];
			HOSTS_FILE.push(row);
		}
		row[1].push(...hostnames.filter(name => !row[1].includes(name)));

		save(HOSTS_FILE);
		return render(HOSTS_FILE);
	},
	remove(_ip, ...hostnames) {
		const row = HOSTS_FILE.find(([ip]) => ip === _ip);
		if (!row)
			return `ERROR: ${_ip} is not present in hosts file.`
		
		row[1] = row[1].filter(hostname => !hostnames.includes(hostname));

		const hosts = row[1].length ? HOSTS_FILE : HOSTS_FILE.filter(([ip]) => ip !== _ip);
		save(hosts);
		return render(hosts);
	},
	clear(_ip) {
		const hosts = HOSTS_FILE.filter(([ip]) => _ip !== ip);
		save(hosts);
		return render(hosts);
	}
})(CMD, IP, ...hostnames);
