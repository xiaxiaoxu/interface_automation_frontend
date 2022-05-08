import { axios } from '@/utils/request'
const urlPrefix = '/'

export function getTestSuiteList (params) {
  return axios({
    method: 'post',
    url: `${urlPrefix}testsuit/`,
    data: params
  })
}

export function runTestSuite (params) {
  return axios({
    method: 'post',
    url: `${urlPrefix}runTestSuit/`,
    data: params
  })
}
