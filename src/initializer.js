import axios from 'axios';
import { HttpError } from './errors';

// Handle HTTP errors.
export default ({ retryCount, messageCreator }) => {
  // Request interceptor
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      const password = localStorage.getItem('password');

      const newConfig = {...config};

      // When a 'token' is available set as Bearer token.
      if (token) {
        newConfig.headers.Authorization = `Bearer ${token}`;
      }

      if (config.headers && (typeof config.headers === 'function')) {
        newConfig.headers = config.headers()
      }

      // When username and password are available use
      // as basic auth credentials.
      if (username && password) {
        newConfig.auth = { username, password };
      }

      return newConfig;
    },
    err => Promise.reject(err),
  );

  // Response interceptors
  if (retryCount > 0) {
    const retryCounter = {}

    axios.interceptors.response.use(
      null,
      error => {
        if (!error.config) {
          return Promise.reject(error)
        }
        if (error.response.status == 400) {
          // Since 500s also are sometimes retry-able, we whitelist what we do not retry
          return Promise.reject(error)
        }
        if (!retryCounter[error.config.url]) {
          retryCounter[error.config.url] = 0
        }
        retryCounter[error.config.url] += 1
        if (retryCounter[error.config.url] < retryCount) {
          return axios(error.config)
        } else {
          delete retryCounter[error.config.url]
          return Promise.reject(error)
        }
      }
    )
  }
  axios.interceptors.response.use(
    response => response,
    (error) => {
      if (!error.response) {
        return Promise.reject(error)
      }
      const { status, data } = error.response;

      if (status < 200 || status >= 300) {
        return Promise.reject(
          new HttpError(data, status, messageCreator),
        );
      }

      return Promise.reject(error);
    },
  );
};
