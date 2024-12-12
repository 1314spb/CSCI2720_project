import axios from 'axios';
import { fetchCsrfToken } from './csrfFetching';

let csrfToken = null;
const apiCsrf = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true,
});

apiCsrf.interceptors.request.use(
    async (config) => {
        // console.log('Intercepting request:', config);
        if (['post', 'put', 'delete'].includes(config.method)) {
            if (!csrfToken) {
                csrfToken = await fetchCsrfToken();
            }
            config.headers['csrf-token'] = csrfToken;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default apiCsrf;
