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
const save = hosts => write(FILE, render(hosts) + NEWLINE);

const HOSTS_FILE = read(FILE);

export default Program({
	["@default"]() {
		return this.pass('list');
	},
	list(_ip) {
		return this.println(_ip ? HOSTS_FILE
						.filter(([ip]) => _ip === ip)
						.map(([ip, hostnames]) => hostnames.join(SPACE)).join(NEWLINE) : render(HOSTS_FILE));
	},
	add(_ip, ...hostnames) {
		let row = HOSTS_FILE.find(([ip]) => ip === _ip);
		
		if (!row) {
			row = [_ip, []];
			HOSTS_FILE.push(row);
		}
		row[1].push(...hostnames.filter(name => !row[1].includes(name)));

		save(HOSTS_FILE);
		return this.println(render(HOSTS_FILE));
	},
	remove(_ip, ...hostnames) {
		const row = HOSTS_FILE.find(([ip]) => ip === _ip);
		if (!row)
			return `ERROR: ${_ip} is not present in hosts file.`
		
		row[1] = row[1].filter(hostname => !hostnames.includes(hostname));

		const hosts = row[1].length ? HOSTS_FILE : HOSTS_FILE.filter(([ip]) => ip !== _ip);
		save(hosts);
		return this.println(render(hosts));
	},
	clear(_ip) {
		const hosts = HOSTS_FILE.filter(([ip]) => _ip !== ip);
		save(hosts);
		return this.println(render(hosts));
	}
});
