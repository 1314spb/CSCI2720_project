import axios from 'axios';

const fetchUserData = async (setUser, setError) => {
  console.log("fetchUserData is running");
  try {
    const response = await axios.get('http://localhost:3000/api/user/getPersonalInfo', {
      headers: {
        'Content-Type':'application/json',
      },
      withCredentials: true, // Include HTTP-only cookies in the request
    });

    console.log(response.data);
    setUser(response.data);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      setError('Unauthorized: Please log in again');
    } else {
      setError('Failed to fetch user data');
    }
    console.error('Error fetching user data:', error);
  }
};

export default fetchUserData;