import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiCsrf from '../../../apiCsrf';

const EventsManager = () => {
  const [events, setEvents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(10);

  const [searchQuery, setSearchQuery] = useState("");

  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const fetchEventList = async () => {
      console.log("fetchEventList is running");
      try {
        const response = await axios.get('http://localhost:3000/api/user/event', {
          withCredentials: true, // Include HTTP-only cookies in the request
        });

        console.log(response.data);
        setEvents(response.data);

        if (response.data.length > 0) {
          const updatedTime = new Date().toLocaleString();
          setLastUpdated(updatedTime);
        }
      } catch (error) {
        console.error('Error fetching event data:', error);
      }
    }

    const fetchLocationList = async () => {
      console.log("fetchLocationList is running");
      try {
        const response = await axios.get('http://localhost:3000/api/user/location', {
          withCredentials: true, // Include HTTP-only cookies in the request
        });

        console.log(response.data);
        setLocations(response.data);
      } catch (error) {
        console.error('Error fetching location data:', error);
      }
    }

    fetchEventList();
    fetchLocationList();
  }, []);

  // Handler to open modal and set selected event
  const handleEditClick = (event) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  // Handler to close modal
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedEvent(null);
  };

  // Handler for form input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedEvent((prevEvent) => {
      const updatedEvent = {
        ...prevEvent,
        [name]: value,
      }
      if (name === 'venue') {
        const selectedLocation = locations.find(location => location.name === value);
        updatedEvent.locId = selectedLocation ? selectedLocation.locId : null;
      }
      return updatedEvent;
    })
  };

  // Handler to save changes
  const handleSaveChanges = (e) => {
    e.preventDefault();
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.eventId === selectedEvent.eventId ? selectedEvent : event
      )
    );

    const saveEditInfo = async () => {
      console.log('saveEditInfo is runnning');
      console.log(selectedEvent);
      const response = await apiCsrf.put('/api/admin/editevent', 
          {
            eventId: selectedEvent.eventId,
            title: selectedEvent.title,
            datetime: selectedEvent.datetime,
            presenter: selectedEvent.presenter,
            description: selectedEvent.description,
            venue: selectedEvent.venue,
            locId: selectedEvent.locId,
          },
          {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
          });
      console.log(response.data);
    }
    saveEditInfo();

    handleCloseModal();
  };

  // Handler to delete a event (Optional)
  const handleDeleteClick = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents((prevEvents) => prevEvents.filter((event) => event.eventId !== eventId));

      const deleteEvent = async () => {
        console.log('deleteEvent is runnning');
        const response = await apiCsrf.delete(`/api/admin/deleteEvent/${eventId}`, {
            withCredentials: true
            });
        console.log(response.data);
      }
      deleteEvent();
    }
  };

  // Handler to open create new user modal
  const handleNewClick = () => {
    setIsNewModalOpen(true);
  }

  // Handler to close new modal
  const handleCloseNewModal = () => {
    setIsNewModalOpen(false);
    setNewEvent(null);
  }

  // Handler for form input changes
  const handleNewInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prevEvent) => ({
      ...prevEvent,
      [name]: value,
    }));
    if (!newEvent.venue) {
      setNewEvent((prevEvent) => ({
        ...prevEvent,
        venue: locations[0].name,
        locId: locations[0].locId
      }))
    }
  };

  // Handler for saving new event
  const handleCreateEvent = (e) => {
    e.preventDefault();

    const saveNewEventInfo = async () => {
      console.log('saveNewEventInfo is runnning');
      try {
        const response = await apiCsrf.post('/api/admin/createevent', 
          {
            title: newEvent.title,
            description: newEvent.description,
            datetime: newEvent.datetime,
            presenter: newEvent.presenter,
            venue: newEvent.venue,
            locId: newEvent.locId
          },
          {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
          });
        console.log(response.data);
        setEvents((prevEvents) => [
          ...prevEvents,
          { ...response.data.data }
        ]);
        handleCloseNewModal();
      } catch (err) {

      }
    }
    saveNewEventInfo();
  }

  const handleModalClick = (e) => {
    // Prevent closing the modal when clicking inside of it
    e.stopPropagation();
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  const totalPages = Math.ceil(events.length / eventsPerPage);

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
            New Event
          </button>
          <input
            type="text"
            placeholder="Search events by title..."
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
              'Event Title',
              'Description',
              'Venue',
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
          {currentEvents.map((event) => (
            <tr key={event.eventId}>
              {/* Title */}
              <td className="px-6 py-4 whitespace-normal max-w-[300px]">
                  <div className="ml-4 overflow-hidden">
                      <div className="text-sm font-medium text-gray-900 text-left whitespace-pre-wrap break-words">
                          {event.title}
                      </div>
                  </div>
              </td>

              {/* Description */}
              <td className="px-6 py-4 whitespace-normal max-w-[400px]">
                  <div className="overflow-hidden">
                      <div className="text-sm text-gray-900 text-left whitespace-pre-wrap break-words">
                          {event.description?event.description:'N/A'}
                      </div>
                  </div>
              </td>

              {/* Venue */}
              <td className="px-6 py-4 whitespace-normal max-w-[200px]">
                  <div className="overflow-hidden">
                      <div className="text-sm text-gray-900 text-left whitespace-pre-wrap break-words">
                          {event.venue}
                      </div>
                  </div>
              </td>

              {/* Price */}
              <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 text-left max-w-[125px]">
                  <div className="overflow-hidden">
                      <div className="whitespace-pre-wrap break-words">
                          {event.price?event.price:'N/A'}
                      </div>
                  </div>
              </td>

              {/* Presenter */}
              <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 text-left max-w-[225px]">
                  <span
                      className="px-2 inline-flex text-sm leading-5 font-semibold rounded-lg text-left bg-green-100 text-green-800"
                      style={{ display: 'block', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                      <span className="whitespace-pre-wrap break-words">
                          {event.presenter}
                      </span>
                  </span>
              </td>

              {/* Date & Time */}
              <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 text-left max-w-[150px]">
                  <div className="overflow-hidden">
                      <div className="whitespace-pre-wrap break-words">
                          <div className="text-sm font-medium text-gray-900 text-left">
                              {event.datetime}
                          </div>
                      </div>
                  </div>
              </td>

              {/* Actions */}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => handleEditClick(event)}
                  className="text-indigo-600 hover:text-indigo-900 mr-2"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDeleteClick(event.eventId)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {/* If no events */}
          {filteredEvents.length === 0 && (
            <tr>
              <td
                className="px-6 py-4 whitespace-nowrap text-center text-gray-500"
                colSpan="6"
              >
                No events available.
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
      {isEditModalOpen && selectedEvent && (
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
                    {/* Title */}
                    <div className="col-span-6 sm:col-span-6">
                      <label
                        htmlFor="title"
                        className="text-sm font-medium text-gray-900 block mb-2"
                      >
                        Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        value={selectedEvent.title}
                        onChange={handleEditInputChange}
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm 
                                   rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div className="col-span-6 sm:col-span-6">
                      <label
                        htmlFor="description"
                        className="text-sm font-medium text-gray-900 block mb-2"
                      >
                        Description
                      </label>
                      <textarea
                        type="text"
                        name="description"
                        id="description"
                        value={selectedEvent.description}
                        onChange={handleEditInputChange}
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm 
                                   rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                      />
                    </div>

                    {/* Presenter */}
                    <div className="col-span-6 sm:col-span-6">
                      <label
                        htmlFor="presenter"
                        className="text-sm font-medium text-gray-900 block mb-2"
                      >
                        Presenter(s)
                      </label>
                      <input
                        type="text"
                        name="presenter"
                        id="presenter"
                        value={selectedEvent.presenter}
                        onChange={handleEditInputChange}
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm 
                                   rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                        required
                      />
                    </div>

                    {/* Venue */}
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="venue"
                        className="text-sm font-medium text-gray-900 block mb-2"
                      >
                        Venue
                      </label>
                      <select
                        name="venue"
                        id="venue"
                        value={selectedEvent.venue}
                        onChange={handleEditInputChange}
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm 
                                   rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                        required
                      >
                        {locations.map((location) => (
                            <option key={location.locId} value={location.name}>
                                {location.name}
                            </option>
                        ))}
                      </select>
                    </div>
                    {/* Date & Time */}
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="datetime"
                        className="text-sm font-medium text-gray-900 block mb-2"
                      >
                        Date & Time
                      </label>
                      <input
                        type="text"
                        name="datetime"
                        id="datetime"
                        value={selectedEvent.datetime}
                        onChange={handleEditInputChange}
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
                        Price ($)
                      </label>
                      <input
                        type="text"
                        name="price"
                        id="price"
                        value={selectedEvent.price}
                        onChange={handleEditInputChange}
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
      
      {/* New Modal */}
      {isNewModalOpen && !selectedEvent && (
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
                  Create New Event
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

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                <form onSubmit={handleCreateEvent}>
                  <div className="grid grid-cols-6 gap-6">
                    {/* Title */}
                    <div className="col-span-6 sm:col-span-6">
                      <label
                        htmlFor="title"
                        className="text-sm font-medium text-gray-900 block mb-2"
                      >
                        Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        onChange={handleNewInputChange}
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm 
                                   rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div className="col-span-6 sm:col-span-6">
                      <label
                        htmlFor="description"
                        className="text-sm font-medium text-gray-900 block mb-2"
                      >
                        Description
                      </label>
                      <textarea
                        type="text"
                        name="description"
                        id="description"
                        onChange={handleNewInputChange}
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm 
                                   rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                      />
                    </div>

                    {/* Presenter */}
                    <div className="col-span-6 sm:col-span-6">
                      <label
                        htmlFor="presenter"
                        className="text-sm font-medium text-gray-900 block mb-2"
                      >
                        Presenter(s)
                      </label>
                      <input
                        type="text"
                        name="presenter"
                        id="presenter"
                        onChange={handleNewInputChange}
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm 
                                   rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                        required
                      />
                    </div>

                    {/* Venue */}
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="venue"
                        className="text-sm font-medium text-gray-900 block mb-2"
                      >
                        Venue
                      </label>
                      <select
                        name="venue"
                        id="venue"
                        onChange={handleNewInputChange}
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm 
                                   rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
                        required
                      >
                        <option value="" disabled>Select a venue</option>
                        {locations.map((location) => (
                            <option key={location.locId} value={location.name}>
                                {location.name}
                            </option>
                        ))}
                      </select>
                    </div>
                    {/* Date & Time */}
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="datetime"
                        className="text-sm font-medium text-gray-900 block mb-2"
                      >
                        Date & Time
                      </label>
                      <input
                        type="text"
                        name="datetime"
                        id="datetime"
                        onChange={handleNewInputChange}
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
                        Price ($)
                      </label>
                      <input
                        type="text"
                        name="price"
                        id="price"
                        onChange={handleNewInputChange}
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

export default EventsManager;