import { axios } from '@/utils/request'
const urlPrefix = '/'

export function getProjectList (params) {
  return axios({
    method: 'post',
    url: `${urlPrefix}project/`,
    data: params
  })
}
