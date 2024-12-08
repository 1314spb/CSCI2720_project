import React, { useState } from 'react';

const initialUsers = [
  {
    id: 1,
    name: 'Jane Cooper',
    email: 'jane.cooper@example.com',
    title: 'Regional Paradigm Technician',
    department: 'Optimization',
    status: 'Active',
    role: 'Admin',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: 2,
    name: 'John Smith',
    email: 'john.smith@example.com',
    title: 'Senior Developer',
    department: 'Engineering',
    status: 'Inactive',
    role: 'User',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  // Add more user objects as needed
];

const UsersManager = () => {
  const [users, setUsers] = useState(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Handler to open modal and set selected user
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Handler to close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  // Handler for form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  // Handler to save changes
  const handleSaveChanges = (e) => {
    e.preventDefault();
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === selectedUser.id ? selectedUser : user
      )
    );
    handleCloseModal();
  };

  // Handler to delete a user (Optional)
  const handleDeleteClick = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    }
  };

  const handleModalClick = (e) => {
    // Prevent closing the modal when clicking inside of it
    e.stopPropagation();
  };

  return (
    <div className="overflow-x-auto h-full w-full p-4">
      <table className="min-w-full divide-y divide-gray-200">
        {/* Table Header */}
        <thead className="bg-gray-50">
          <tr>
            {[
              'Name',
              'Password',
              'Status',
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
          {users.map((user) => (
            <tr key={user.id}>
              {/* Name & Email */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {/* Avatar */}
                  <div className="flex-shrink-0 h-10 w-10">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={user.avatar}
                      alt={user.name}
                    />
                  </div>
                  {/* User Info */}
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 text-left">
                      {user.name}
                    </div>
                    <div className="text-sm text-gray-500 text-left">{user.email}</div>
                  </div>
                </div>
              </td>

              {/* Title & Department */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 text-left">{user.title}</div>
                <div className="text-sm text-gray-500 text-left">{user.department}</div>
              </td>

              {/* Status */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-left ${user.status === 'Active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}
                >
                  {user.status}
                </span>
              </td>

              {/* Role */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                {user.role}
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
                  onClick={() => handleDeleteClick(user.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {/* If no users */}
          {users.length === 0 && (
            <tr>
              <td
                className="px-6 py-4 whitespace-nowrap text-center text-gray-500"
                colSpan="6"
              >
                No users available.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Edit Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed z-10 inset-0 overflow-y-auto" onClick={handleCloseModal}>
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
                  onClick={handleCloseModal}
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

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                <form onSubmit={handleSaveChanges}>
                  <div className="grid grid-cols-6 gap-6">
                    {/* Name */}
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="name"
                        className="text-sm font-medium text-gray-900 block mb-2"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={selectedUser.name}
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-400 sm:text-sm 
                                   rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                        readOnly
                      />
                    </div>

                    {/* Password */}
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="title"
                        className="text-sm font-medium text-gray-900 block mb-2"
                      >
                        Password
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        value={selectedUser.title}
                        onChange={handleInputChange}
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
                        name="role"
                        id="role"
                        value={selectedUser.role}
                        onChange={handleInputChange}
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm 
                                   rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                        required
                      >
                        <option value="Admin">Admin</option>
                        <option value="User">User</option>
                        {/* Add more roles as needed */}
                      </select>
                    </div>

                    {/* Status */}
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="status"
                        className="text-sm font-medium text-gray-900 block mb-2"
                      >
                        Status
                      </label>
                      <select
                        name="status"
                        id="status"
                        value={selectedUser.status}
                        onChange={handleInputChange}
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm 
                                   rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                        required
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
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
    </div>
  );
};

export default UsersManager;