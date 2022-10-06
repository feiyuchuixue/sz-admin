import Cookies from 'js-cookie'

const TokenKey = 'access_token'

const RefreshTokenKey = 'refresh_token'

export function getAccessToken() {
  return Cookies.get(TokenKey)
}

export function setAccessToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeAccessToken() {
  return Cookies.remove(TokenKey)
}

export function getRefreshToken() {
  return Cookies.get(RefreshTokenKey)
}

export function setRefreshToken(token) {
  return Cookies.set(RefreshTokenKey, token)
}

export function removeRefreshToken() {
  return Cookies.remove(RefreshTokenKey)
}

