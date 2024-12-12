import axios from 'axios';

let csrfToken = null;

export const fetchCsrfToken = async () => {
    if (!csrfToken) {
        try {
            console.log('Fetching CSRF token...');
            const response = await axios.get('http://localhost:3000/api/csrf/csrf-token', {
                withCredentials: true,
            });
            csrfToken = response.data.csrfToken;
            // console.log('CSRF token fetched:', csrfToken);
        } catch (error) {
            console.error('Error fetching CSRF token:', error);
            throw new Error('Could not fetch CSRF token');
        }
    }
    return csrfToken;
};

export const clearCsrfToken = () => {
    csrfToken = null;
};
