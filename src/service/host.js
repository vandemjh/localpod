const { execSync } = require('child_process');

const hostname = process.env.HOSTNAME || execSync(`tailscale ip -4`).toString().trim();
const getHostname = () => hostname;

const getPort = () => process.env.PORT || 3000

const getFullURL = () => `${getHostname()}:${getPort()}`

module.exports = { getHostname, getPort, getFullURL };
