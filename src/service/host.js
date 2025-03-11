const hostname = process.env.LOCALCPOD_HOSTNAME || 'localhost';

const getHostname = () => hostname;

const getPort = () => process.env.PORT || 56225;

const getProto = () => process.env.PROTO || 'http';

const getFullURL = () => `${getProto()}://${getHostname()}`; // :${getPort()}`

module.exports = { getHostname, getPort, getFullURL, getProto };
