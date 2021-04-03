#!/bin/env node

import DNS from "./index.js";

let [
	IP,
	CMD,
	...hostnames
] = process.argv.slice(2);

if (!IP || !CMD)
	CMD = "list";

DNS(CMD, IP, ...hostnames);