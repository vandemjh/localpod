const { execSync } = require('child_process');

const hostname = execSync(`tailscale ip -4`);
const getHostname = () => hostname;

module.exports = { getHostname };
