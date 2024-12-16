import React, { useEffect, useState } from 'react';
import axios from 'axios';
import apiCsrf from '../../../apiCsrf';

const UsersManager = () => {
  const [users, setUsers] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newUser, setNewUser] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  const [searchQuery, setSearchQuery] = useState("");

  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const fetchUsersList = async () => {
      console.log("fetchUsersList is running");
      try {
        const response = await axios.get('http://localhost:3000/api/admin/userlist', {
          withCredentials: true, // Include HTTP-only cookies in the request
        });

        console.log(response.data);
        setUsers(response.data);

        if (response.data.length > 0) {
          const updatedTime = new Date().toLocaleString(); // You can format this as needed
          setLastUpdated(updatedTime);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUsersList();
  }, []);

  // Handler to open modal and set selected user
  const handleEditClick = (user) => {
    setSelectedUser(user);
    console.log(user);
    setIsEditModalOpen(true);
  };

  // Handler to close modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  // Handler for form input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser((prevUser) => ({
      ...prevUser,
      [name]: name=='admin'?(value=='Admin'?true:false):value,
    }));
  };

  // Handler to save changes
  const handleSaveChanges = (e) => {
    e.preventDefault();
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.userId === selectedUser.userId ? selectedUser : user
      )
    );

    const saveEditInfo = async () => {
      console.log('saveEditInfo is runnning');
      try {
        const response = await apiCsrf.put('/api/admin/editPersonalInfo', 
          {
            userId: selectedUser.userId,
            username: selectedUser.username,
            admin: selectedUser.admin,
            email: selectedUser.email
          },
          {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
          });

          handleCloseEditModal();
      } catch (err) {
        alert(err.response.data.message);
      }
      
    }
    saveEditInfo();
  };

  // Handler to delete a user (Optional)
  const handleDeleteClick = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers((prevUsers) => prevUsers.filter((user) => user.userId !== userId));

      const deleteUser = async () => {
        console.log('deleteUser is runnning');
        const response = await apiCsrf.delete(`/api/admin/deleteUser/${userId}`, {
            withCredentials: true
            });
        console.log(response.data);
      }
      deleteUser();
    }
  };

  // Handler to open create new user modal
  const handleNewClick = () => {
    setIsNewModalOpen(true);
  }

  // Handler to close new modal
  const handleCloseNewModal = () => {
    setIsNewModalOpen(false);
    setNewUser(null);
  }

  // Handler for form input changes
  const handleNewInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prevUser) => ({
      ...prevUser,
      [name]: name=='admin'?(value=='Admin'?true:false):value,
    }));
    if (newUser.admin === undefined) {
      setNewUser((prevUser) => ({
        ...prevUser,
        admin: true
      }))
    }
  };

  // Handler for saving new user
  const handleCreateUser = (e) => {
    e.preventDefault();
    const saveNewUserInfo = async () => {
      console.log('saveNewUserInfo is runnning');
      try {
      const response = await apiCsrf.post('/api/admin/createuser', 
        {
          username: newUser.username,
          email: newUser.email,
          password: newUser.password,
          admin: newUser.admin
        },
        {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
        });
        console.log(response.data);
        setUsers((preUsers) => [
          ...preUsers,
          { ...response.data.data }
        ]);
        handleCloseNewModal();
      } catch (err) {
        alert(err.response.data.error);
        console.log(err);
      }
    }
    saveNewUserInfo();
  }

  const handleModalClick = (e) => {
    // Prevent closing the modal when clicking inside of it
    e.stopPropagation();
  };

  const filteredUsers = users.filter(users =>
    users.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(users.length / usersPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Searching Logic
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="overflow-x-auto h-full w-full p-4">
      <div className="mb-4 flex justify-between items-center">
        <div className="flex">
          <button 
            onClick={() => handleNewClick()}
            className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 mr-4"
          >
            New User
          </button>
          <input
            type="text"
            placeholder="Search users by username..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="border p-2 rounded"
          />
        </div>
        <div className="text-gray-500 text-sm">Last Updated on {lastUpdated}</div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handlePreviousPage} 
            disabled={currentPage === 1} 
            className="bg-gray-300 p-2 rounded"
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages} 
            className="bg-gray-300 p-2 rounded"
          >
            Next
          </button>
        </div>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        {/* Table Header */}
        <thead className="bg-gray-50">
          <tr>
            {[
              'Name',
              'Role',
              'Actions',
            ].map((header) => (
              <th
                key={header}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="bg-white divide-y divide-gray-200">
          {currentUsers.map((user) => (
            <tr key={user.userId}>
              {/* Name & Email */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {/* User Info */}
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 text-left">
                      {user.username}
                    </div>
                    <div className="text-sm text-gray-500 text-left">{user.email}</div>
                  </div>
                </div>
              </td>

              {/* Role */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                {user.admin?'Admin':'User'}
              </td>

              {/* Actions */}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex">
                <button
                  onClick={() => handleEditClick(user)}
                  className="text-indigo-600 hover:text-indigo-900 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(user.userId)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {/* If no users */}
          {filteredUsers.length === 0 && (
            <tr>
              <td
                className="px-6 py-4 whitespace-nowrap text-center text-gray-500"
                colSpan="6"
              >
                No users available.
              </td>
            </tr>
          )}
          <tr>
            <td colSpan="7">
              <div className="flex justify-between mt-4">
                <button 
                  onClick={handlePreviousPage} 
                  disabled={currentPage === 1} 
                  className="bg-gray-300 p-2 rounded"
                >
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button 
                  onClick={handleNextPage} 
                  disabled={currentPage === totalPages} 
                  className="bg-gray-300 p-2 rounded"
                >
                  Next
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Edit Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed z-10 inset-0 overflow-y-auto" onClick={handleCloseEditModal}>
          <div
            className="flex items-center justify-center min-h-screen px-4"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full relative mt-6" onClick={handleModalClick}>
              {/* Modal Header */}
              <div className="flex items-start justify-between p-5 border-b rounded-t">
                <h3 className="text-xl font-semibold" id="modal-title">
                  Edit User
                </h3>
                <button
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                  onClick={handleCloseEditModal}
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 
                         8.586l4.293-4.293a1 1 0 
                         111.414 1.414L11.414 
                         10l4.293 4.293a1 1 0 
                         01-1.414 1.414L10 
                         11.414l-4.293 4.293a1 
                         1 0 01-1.414-1.414L8.586 
                         10 4.293 5.707a1 
                         1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </button>
              </div>

              {/* Edit Modal Body */}
              <div className="p-6 space-y-6">
                <form onSubmit={handleSaveChanges}>
                  <div className="grid grid-cols-6 gap-6">
                    {/* Name */}
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="username"
                        className="text-sm font-medium text-gray-900 block mb-2"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        name="username"
                        id="username"
                        value={selectedUser.username}
                        onChange={handleEditInputChange}
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm 
                                   rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-900 block mb-2"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={selectedUser.email}
                        onChange={handleEditInputChange}
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm 
                                   rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                        required
                      />
                    </div>

                    {/* Role */}
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="role"
                        className="text-sm font-medium text-gray-900 block mb-2"
                      >
                        Role
                      </label>
                      <select
                        name="admin"
                        id="admin"
                        value={selectedUser.admin?'Admin':'User'}
                        onChange={handleEditInputChange}
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm 
                                   rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                        required
                      >
                        <option value="Admin">Admin</option>
                        <option value="User">User</option>
                        {/* Add more roles as needed */}
                      </select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="p-6 rounded-b">
                    <button
                      type="submit"
                      className="text-white bg-cyan-600 hover:bg-cyan-700 focus:ring-4 
                                 focus:ring-cyan-200 font-medium rounded-lg text-sm 
                                 px-5 py-2.5 text-center"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Modal */}
      {isNewModalOpen && !selectedUser && (
        <div className="fixed z-10 inset-0 overflow-y-auto" onClick={handleCloseNewModal}>
          <div
            className="flex items-center justify-center min-h-screen px-4"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full relative mt-6" onClick={handleModalClick}>
              {/* Modal Header */}
              <div className="flex items-start justify-between p-5 border-b rounded-t">
                <h3 className="text-xl font-semibold" id="modal-title">
                  Create New User
                </h3>
                <button
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                  onClick={handleCloseNewModal}
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 
                         8.586l4.293-4.293a1 1 0 
                         111.414 1.414L11.414 
                         10l4.293 4.293a1 1 0 
                         01-1.414 1.414L10 
                         11.414l-4.293 4.293a1 
                         1 0 01-1.414-1.414L8.586 
                         10 4.293 5.707a1 
                         1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </button>
              </div>

              {/* New Modal Body */}
              <div className="p-6 space-y-6">
                <form onSubmit={handleCreateUser}>
                  <div className="grid grid-cols-6 gap-6">
                    {/* Name */}
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="username"
                        className="text-sm font-medium text-gray-900 block mb-2"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        name="username"
                        id="username"
                        onChange={handleNewInputChange}
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm 
                                   rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-900 block mb-2"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        onChange={handleNewInputChange}
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm 
                                   rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                      />
                    </div>

                    {/* Password */}
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="password"
                        className="text-sm font-medium text-gray-900 block mb-2"
                      >
                        Password
                      </label>
                      <input
                        type="text"
                        name="password"
                        id="password"
                        onChange={handleNewInputChange}
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm 
                                   rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                        required
                      />
                    </div>

                    {/* Role */}
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="role"
                        className="text-sm font-medium text-gray-900 block mb-2"
                      >
                        Role
                      </label>
                      <select
                        name="admin"
                        id="admin"
                        onChange={handleNewInputChange}
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm 
                                   rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                        required
                      >
                        <option value="Admin">Admin</option>
                        <option value="User">User</option>
                        {/* Add more roles as needed */}
                      </select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="p-6 rounded-b">
                    <button
                      type="submit"
                      className="text-white bg-cyan-600 hover:bg-cyan-700 focus:ring-4 
                                 focus:ring-cyan-200 font-medium rounded-lg text-sm 
                                 px-5 py-2.5 text-center"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManager;