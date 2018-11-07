import interceptor from 'rest/interceptor'

function updateHeaders(request, accessToken) {
  let headers

  headers = request.headers || (request.headers = {})
  headers.Authorization = `Bearer ${accessToken}`

  return headers
}

function needsAccessToken(pathname) {
  return (
    /^\/*auth\/(?!logout|users\/[0-9a-f]{24}).*$/i.test(pathname) === false &&
    /api\/v1\/helpers\//i.test(pathname) === false
  )
}

function isAccessTokenRequest(pathname) {
  return /^\/*auth\/(access-token|login|oauth-login|password-reset\/[A-Za-z0-9]*)$/i.test(
    pathname
  )
}

export default interceptor({
  init(config) {
    config.onAccessToken = config.onAccessToken || (f => f)
    return config
  },

  request(request, config) {
    if (needsAccessToken(request.path) === true) {
      request.headers = updateHeaders(
        request,
        request.accessToken || config.token
      )
    }

    return request
  },

  response(response, config, meta) {
    if (
      isAccessTokenRequest(response.request.path) &&
      response.status &&
      response.status.code === 200 &&
      response.entity.access_token
    ) {
      config.onAccessToken(response.entity.access_token)
    }

    return response
  },
})
