export function get_getUserIP(request) {
	let requestIp = request.ip; // "255.255.255.255"
	let options = { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } };
	if (requestIp) {
		options.body = { items: requestIp };
		return ok(options);
	}
}
