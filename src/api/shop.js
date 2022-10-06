import request from '@/utils/request'

export function getShopList(params) {
  return request({
    url: '/admin/shop',
    method: 'get',
    params
  })
}
