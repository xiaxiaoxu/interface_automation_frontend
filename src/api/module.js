import { axios } from '@/utils/request'
const urlPrefix = '/'

export function getModuleList (params) {
  return axios({
    method: 'post',
    url: `${urlPrefix}module/`,
    data: params
  })
}
