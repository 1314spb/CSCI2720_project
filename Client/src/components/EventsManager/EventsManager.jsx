import React, { useState, useEffect } from 'react';

const initialEvents = [
  {
    id: 1,
    name: 'Jane Cooper',
    date: '2024-01-01',
    time: '12:00 PM - 2:00 PM',
    location: 'East Kowloon Cultural Centre',
    presenter: 'Tom Scholz',
    price: 1200,
  },
  {
    id: 2,
    name: 'John Smith',
    date: '2024-12-01',
    time: '10:00 AM - 12:00 PM',
    location: 'Hong Kong City Hall (Concert Hall)',
    presenter: 'Tom Holland',
    price: 3000,
  },
  {
    id: 3,
    name: 'Jane Doe',
    date: '2024-06-01',
    time: '3:00 PM - 5:00 PM',
    location: 'Hong Kong Cultural Centre',
    presenter: 'Tom Hanks',
    price: 5000,
  },
  {
    id: 4,
    name: 'John Doe',
    date: '2024-03-01',
    time: '6:00 PM - 8:00 PM',
    location: 'Queen Elizabeth Stadium',
    presenter: 'Tom Cruise',
    price: 8000,
  },
  {
    id: 5,
    name: 'Tom Cruise',
    date: '2024-09-01',
    time: '9:00 PM - 11:00 PM',
    location: 'Kowloonbay International Trade & Exhibition Centre',
    presenter: 'Tom Hardy',
    price: 10000,
  }
];

const EventsManager = () => {
  const [events, setEvents] = useState(initialEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [startTime, setStartTime] = useState('12:00');
  const [endTime, setEndTime] = useState('14:00');

  const handleEventTimeChange = (eventTime) => {
    const [start, end] = eventTime.split(' - ');
    setStartTime(convertTo24Hour(start));
    setEndTime(convertTo24Hour(end));
  };

  const convertTo24Hour = (time) => {
    const [timePart, modifier] = time.split(' ');
    let [hours, minutes] = timePart.split(':');
    if (modifier === 'PM' && hours !== '12') {
      hours = parseInt(hours, 10) + 12;
    }
    if (modifier === 'AM' && hours === '12') {
      hours = '00';
    }
    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    handleEventTimeChange('12:00 PM - 2:00 PM');
  }, []);

  // Handler to open modal and set selected event
  const handleEditClick = (event) => {
    setSelectedLocation(event);
    setIsModalOpen(true);
  };

  // Handler to close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLocation(null);
  };

  // Handler for form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedLocation((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  // Handler to save changes
  const handleSaveChanges = (e) => {
    e.preventDefault();
    setEvents((prevUsers) =>
      prevUsers.map((event) =>
        event.id === selectedLocation.id ? selectedLocation : event
      )
    );
    handleCloseModal();
  };

  // Handler to delete a event (Optional)
  const handleDeleteClick = (userId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents((prevUsers) => prevUsers.filter((event) => event.id !== userId));
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
              'Event Name',
              'Location',
              'Price',
              'Presenter(s)',
              'Date & Time',
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
          {events.map((event) => (
            <tr key={event.id}>
              {/* Name & Email */}
              <td className="px-6 py-4 whitespace-nowrap">


                {/* User Info */}
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900 text-left">
                    {event.name}
                  </div>

                </div>

              </td>

              {/* Title & Department */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 text-left">{event.location}</div>
              </td>

              {/* Status */}


              {/* Role */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                ${event.price}
              </td>

              <td className="px-6 py-4 whitespace-nowrap flex">
                <span
                  className="px-2 inline-flex text-sm leading-5 font-semibold rounded-full text-left bg-green-100 text-green-800"
                >
                  {event.presenter}
                </span>
              </td>

              {/* Email */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                <div className="text-sm font-medium text-gray-900 text-left">
                  {event.date}
                </div>
                <div className="text-sm text-gray-500 text-left">{event.time}</div>
              </td>

              {/* Actions */}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex">
                <button
                  onClick={() => handleEditClick(event)}
                  className="text-indigo-600 hover:text-indigo-900 mr-2"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDeleteClick(event.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {/* If no events */}
          {events.length === 0 && (
            <tr>
              <td
                className="px-6 py-4 whitespace-nowrap text-center text-gray-500"
                colSpan="6"
              >
                No events available.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Edit Modal */}
      {isModalOpen && selectedLocation && (
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
                  Update Event
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
                        value={selectedLocation.name}
                        onChange={handleInputChange}
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm 
                                   rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                        required
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="location"
                        className="text-sm font-medium text-gray-900 block mb-2"
                      >
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        id="location"
                        value={selectedLocation.location}
                        onChange={handleInputChange}
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm 
                                   rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                        required
                      />
                    </div>
                    {/* Email */}
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="date"
                        className="text-sm font-medium text-gray-900 block mb-2"
                      >
                        Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        id="date"
                        value={selectedLocation.date}
                        onChange={handleInputChange}
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm 
                                   rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                        required
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-6 flex space-x-4">
                      <div className="flex-1">
                        <label htmlFor="start-time" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Start time:</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                              <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <input type="time" id="start-time" className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" min="09:00" max="18:00" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                        </div>
                      </div>

                      <div className="flex-1">
                        <label htmlFor="end-time" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">End time:</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                              <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <input type="time" id="end-time" className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" min="09:00" max="18:00" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                        </div>
                      </div>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="name"
                        className="text-sm font-medium text-gray-900 block mb-2"
                      >
                        Price ($)
                      </label>
                      <input
                        type="text"
                        name="department"
                        id="department"
                        value={selectedLocation.price}
                        onChange={handleInputChange}
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm 
                                   rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                        required
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="price"
                        className="text-sm font-medium text-gray-900 block mb-2"
                      >
                        Presenter(s)
                      </label>
                      <input
                        type="text"
                        name="presenter"
                        id="presenter"
                        value={selectedLocation.presenter}
                        onChange={handleInputChange}
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm 
                                   rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                        required
                      />
                    </div>
                  </div>

                  <div className="p-6 border-gray-200 rounded-b">
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

export default EventsManager;