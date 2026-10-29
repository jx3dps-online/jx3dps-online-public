import axios from 'axios'

axios.defaults.baseURL = 'https://cms.jx3box.com'

axios.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err)
)
