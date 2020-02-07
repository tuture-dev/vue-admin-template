import request from '@/utils/request'

export function getTableData(params) {
  return request({
    url: 'getTableData',
    method: 'get',
    params
  })
}
