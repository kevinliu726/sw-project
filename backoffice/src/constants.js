// eslint-disable-next-line import/prefer-default-export
export const SERVER_URL = "http://pinterest-server.test";
export function CONCAT_SERVER_URL(url) {
  return url.startsWith(SERVER_URL) ? url : `${SERVER_URL}${url}`;
}

export const BACKOFFICE_URL = "/backoffice";
export function CONCAT_BACKOFFICE_URL(url) {
  return url.startsWith(BACKOFFICE_URL) ? url : `${BACKOFFICE_URL}${url}`;
}
