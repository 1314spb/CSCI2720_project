import React, { useEffect, useState } from "react";
import axios from 'axios';
import bcrypt from 'bcryptjs';
import apiCsrf from '../../../apiCsrf';

const Profile = () => {
    const [fullName, setFullName] = useState("Jane Ferguson");
    const [email, setEmail] = useState("helloworld@gmail.com");
    const [password, setPassword] = useState('');
    const [enteredPassword, setEnteredPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        const fetchProfileInfo = async () => {
            console.log("fetchProfileInfo is running");
            try {
              const response = await axios.get('http://localhost:3000/api/user/getPersonalInfo', {
                withCredentials: true, // Include HTTP-only cookies in the request
              });

              const user = response.data.user;
              setFullName(user.username);
              setEmail(user.email);
              setPassword(user.password);
            } catch (error) {
              console.error('Error fetching user data:', error);
            }
          };
        fetchProfileInfo();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword.length != 0) {
            const isMatch = await bcrypt.compare(enteredPassword, password);
            if (!isMatch) {
                alert("Incorrect current password");
                return;
            }

            if (newPassword !== confirmPassword) {
                alert("New passwords do not match!");
                return;
            }

            if (enteredPassword === newPassword) {
                alert("New password must be different from the current password!");
                return;
            }

            if (newPassword.length < 8) {
                alert("New password must be at least 8 characters long!");
                return;
            }

            if (newPassword.search(/[a-z]/) < 0) {
                alert("New password must contain at least one lowercase letter!");
                return;
            }
        }

        console.log({ fullName, email, newPassword });

        const fetchEditInfo = async () => {
            console.log('fetchEditInfo is runnning');
            const response = await apiCsrf.put('/api/user/editPersonalInfo', 
                {
                    username: fullName,
                    password: newPassword
                },
                {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true
                });
            console.log(response.data);
        }
        fetchEditInfo();
    };

    return (
        <div className="w-full min-h-screen mb-20 md:p-4 flex justify-center">
            <div className="w-full px-6 pb-8 mt-8 sm:max-w-xl sm:rounded-lg">
                <h2 className="pl-6 text-2xl font-bold sm:text-xl">Public Profile</h2>

                <form onSubmit={handleSubmit} className="grid max-w-2xl mx-auto mt-8">
                    <div className="flex flex-col items-center space-y-5 sm:flex-row sm:space-y-0">
                        <img
                            className="object-cover w-40 h-40 p-1 rounded-full ring-2 ring-indigo-300 dark:ring-indigo-500"
                            src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGZhY2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60"
                            alt="Bordered avatar"
                        />
                    </div>

                    <div className="items-center mt-8 sm:mt-14 text-[#202142]">
                        <div className="mb-2 sm:mb-6">
                            <label htmlFor="full_name" className="block mb-2 text-sm font-medium text-indigo-900 dark:text-white">Your full name</label>
                            <input
                                type="text"
                                id="full_name"
                                className="bg-indigo-50 border border-indigo-300 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                                placeholder="Your full name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-2 sm:mb-6">
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-indigo-900 dark:text-white">Your email</label>
                            <input
                                type="email"
                                id="email"
                                className="bg-indigo-50 border border-indigo-300 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                                placeholder="your.email@mail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <p className="mb-2 text-base font-semibold text-indigo-700 dark:text-white">Enter current password to change password</p>
                            <label htmlFor="password" className="block mb-2 text-sm font-medium text-indigo-900 dark:text-white">Current Password</label>
                            <input
                                type="password"
                                id="password"
                                className="bg-indigo-50 border border-indigo-300 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                                placeholder="Current password"
                                onChange={(e) => setEnteredPassword(e.target.value)}
                            />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="new_password" className="block mb-2 text-sm font-medium text-indigo-900 dark:text-white">New Password</label>
                            <input
                                type="password"
                                id="new_password"
                                className="bg-indigo-50 border border-indigo-300 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                                placeholder="New password"
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="confirm_password" className="block mb-2 text-sm font-medium text-indigo-900 dark:text-white">Confirm New Password</label>
                            <input
                                type="password"
                                id="confirm_password"
                                className="bg-indigo-50 border border-indigo-300 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                                placeholder="Confirm new password"
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" className="text-white bg-indigo-700 hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800">
                                Save
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Profile;