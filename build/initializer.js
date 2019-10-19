'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _errors = require('./errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Handle HTTP errors.
exports.default = function (_ref) {
  var retryCount = _ref.retryCount;

  // Request interceptor
  _axios2.default.interceptors.request.use(function (config) {
    var token = localStorage.getItem('token');
    var username = localStorage.getItem('username');
    var password = localStorage.getItem('password');

    var newConfig = config;

    // When a 'token' is available set as Bearer token.
    if (token) {
      newConfig.headers.Authorization = 'Bearer ' + token;
    }

    // When username and password are available use
    // as basic auth credentials.
    if (username && password) {
      newConfig.auth = { username: username, password: password };
    }

    return newConfig;
  }, function (err) {
    return Promise.reject(err);
  });

  // Response interceptors
  if (retryCount > 0) {
    var retryCounter = {};

    _axios2.default.interceptors.response.use(null, function (error) {
      if (!retryCounter[error.config.url]) {
        retryCounter[error.config.url] = 0;
      }
      retryCounter[error.config.url] += 1;
      if (retryCounter[error.config.url] < retryCount) {
        return (0, _axios2.default)(error.config);
      } else {
        delete retryCounter[error.config.url];
        return Promise.reject(error);
      }
    });
  }
  _axios2.default.interceptors.response.use(function (response) {
    return response;
  }, function (error) {
    var _error$response = error.response,
        status = _error$response.status,
        data = _error$response.data;


    if (status < 200 || status >= 300) {
      return Promise.reject(new _errors.HttpError(data, status));
    }

    return Promise.reject(error);
  });
};