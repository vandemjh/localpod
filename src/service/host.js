const hostname = process.env.LOCALCPOD_HOSTNAME || 'localhost';

const getHostname = () => hostname;

const getPort = () => parseInt(process.env.PORT || '') || 56225;

const getProto = () => process.env.PROTO || 'http';

const getFullURL = () => {
  const proto = getProto();
  const host = getHostname();
  const port = getPort();

  const isProduction = process.env.NODE_ENV === 'production';
  const url = isProduction
    ? `${proto}://${host}`
    : `${proto}://${host}:${port}`;

  return new URL(url).href;
};

module.exports = { getHostname, getPort, getFullURL, getProto };
