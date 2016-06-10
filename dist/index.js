(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('rest'), require('rest/interceptor/mime'), require('rest/interceptor/errorCode'), require('rest/interceptor/defaultRequest'), require('rest/interceptor/pathPrefix'), require('rest/interceptor'), require('when')) :
    typeof define === 'function' && define.amd ? define(['rest', 'rest/interceptor/mime', 'rest/interceptor/errorCode', 'rest/interceptor/defaultRequest', 'rest/interceptor/pathPrefix', 'rest/interceptor', 'when'], factory) :
    (global.sdk = factory(global.rest,global.mime,global.errorCode,global.defaultRequest,global.pathPrefix,global.interceptor,global.when));
}(this, function (rest,mime,errorCode,defaultRequest,pathPrefix,interceptor,when) { 'use strict';

                                                                                    rest = 'default' in rest ? rest['default'] : rest;
                                                                                    mime = 'default' in mime ? mime['default'] : mime;
                                                                                    errorCode = 'default' in errorCode ? errorCode['default'] : errorCode;
                                                                                    defaultRequest = 'default' in defaultRequest ? defaultRequest['default'] : defaultRequest;
                                                                                    pathPrefix = 'default' in pathPrefix ? pathPrefix['default'] : pathPrefix;
                                                                                    interceptor = 'default' in interceptor ? interceptor['default'] : interceptor;
                                                                                    when = 'default' in when ? when['default'] : when;

                                                                                    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
                                                                                      return typeof obj;
                                                                                    } : function (obj) {
                                                                                      return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
                                                                                    };

                                                                                    // Auth client.
                                                                                    var auth$1 = null;

                                                                                    var currentToken = null;
                                                                                    // Token
                                                                                    var token = function token() {
                                                                                      if (!currentToken) {
                                                                                        currentToken = when.promise(function (res, rej) {
                                                                                          auth$1({ path: 'access-token', client_id: true }).then(function (response) {
                                                                                            if (response.status.code === 200) {
                                                                                              res(response.entity.access_token);
                                                                                            } else {
                                                                                              rej(response.status.code);
                                                                                            }
                                                                                          });
                                                                                        });
                                                                                      }

                                                                                      return currentToken;
                                                                                    };

                                                                                    var qipp = interceptor({
                                                                                      init: function init(config) {
                                                                                        auth$1 = config.auth;

                                                                                        return config;
                                                                                      },
                                                                                      request: function request(_request, config, meta) {
                                                                                        return token().then(function (bearerToken) {
                                                                                          var headers = void 0;
                                                                                          headers = _request.headers || (_request.headers = {});
                                                                                          headers.authorization = 'Bearer ' + bearerToken;

                                                                                          return _request;
                                                                                        });
                                                                                      },
                                                                                      success: function success(response, config, meta) {
                                                                                        var entity = response.entity;

                                                                                        if ((typeof entity === 'undefined' ? 'undefined' : _typeof(entity)) === 'object' && entity.access_token) {
                                                                                          auth$1 = entity;
                                                                                        }

                                                                                        return response;
                                                                                      }
                                                                                    });

                                                                                    function getToken(response) {
                                                                                      return response.entity.csrfToken;
                                                                                    }

                                                                                    var csrf = interceptor({
                                                                                      init: function init(config) {
                                                                                        // do studd with the config
                                                                                        return config;
                                                                                      },
                                                                                      request: function request(_request, config, meta) {
                                                                                        if (_request.requiresCsrf) {
                                                                                          var client = config.client || _request.originator || client.skip();

                                                                                          return client({
                                                                                            path: config.path,
                                                                                            clientID: true,
                                                                                            method: 'GET'
                                                                                          }).then(function (response) {
                                                                                            return {
                                                                                              csrfToken: getToken(response)
                                                                                            };
                                                                                          }).then(function (response) {
                                                                                            var entity = JSON.parse(_request.entity) || {};
                                                                                            entity.csrfToken = response.csrfToken;
                                                                                            _request.entity = JSON.stringify(entity);

                                                                                            return _request;
                                                                                          });
                                                                                        }

                                                                                        return _request;
                                                                                      },
                                                                                      response: function response(_response, config, meta) {
                                                                                        return _response;
                                                                                      },
                                                                                      success: function success(response, config, meta) {
                                                                                        return response;
                                                                                      },
                                                                                      error: function error(response, config, meta) {
                                                                                        return response;
                                                                                      }
                                                                                    });

                                                                                    // import error from './interceptor/error'
                                                                                    // import clientIdInterceptor from './interceptor/clientId'

                                                                                    var auth = function auth(_ref) {
                                                                                      var path = _ref.path;

                                                                                      return rest.wrap(defaultRequest, { mixin: { withCredentials: true } }).wrap(csrf, { path: path + 'csrf-token' }).wrap(pathPrefix, { prefix: path }).wrap(mime, { mime: 'application/json' }).wrap(errorCode, { code: 400 });
                                                                                    };

                                                                                    var api = function api(_ref2) {
                                                                                      var path = _ref2.path;
                                                                                      var auth = _ref2.auth;

                                                                                      return rest.wrap(defaultRequest).wrap(pathPrefix, { prefix: path }).wrap(mime, { mime: 'application/json' }).wrap(errorCode, { code: 400 }).wrap(qipp, { auth: auth });
                                                                                    };

                                                                                    var index = {
                                                                                      api: api,
                                                                                      auth: auth
                                                                                    };

                                                                                    return index;

                                                                                  }));
