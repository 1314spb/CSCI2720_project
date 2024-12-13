import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
import { PencilIcon } from "@heroicons/react/24/solid";
import {
  Card,
  Typography,
  Button,
  CardBody,
  CardFooter,
  IconButton,
  Tooltip,
  Input,
} from "@material-tailwind/react";
import apiCsrf from '../../../apiCsrf';

const TABLE_HEAD = ["Location", "Number of Events", "Remove"];

const SortableTable = () => {
  const [venues, setVenues] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // 搜索时重置到第一页
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const sortedData = useMemo(() => {
    let data = [...venues];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      data = data.filter(
        (row) =>
          row.location.toLowerCase().includes(lowerSearch)

      );
    }

    if (sortBy) {
      data.sort((a, b) => {
        let aField = a[sortBy];
        let bField = b[sortBy];
        if (sortBy === "online") {
          aField = aField ? "online" : "offline";
          bField = bField ? "online" : "offline";
        }
        if (aField < bField) return sortDirection === "asc" ? -1 : 1;
        if (aField > bField) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [venues, searchTerm, sortBy, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const displayedData = sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const fetchVenues = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/user/userFavorites', {
        headers: {
          'Content-Type':'application/json',
        },
        withCredentials: true, // Include HTTP-only cookies in the request
      });

      // console.log('Response is : ', favLoc);

      const favLoc = response.data.favLoc;
      console.log('Response is : ', favLoc);
      if(!Array.isArray(favLoc)){
        throw new Error('Invalid response format');
      }
      const venueList = favLoc.map((venue) => ({
        locId: venue.locId,
        location: venue.name,
        number_of_events: venue.numEvents,
      }));
      console.log(venueList);
      setVenues(venueList);
    } catch (error) {
      console.error("Error fetching venues:", error);
    }
  };

  const removeFavLoc = async (locId) => {
    try {
      const response = await apiCsrf.put('/api/user/removeFavLoc', 
        { favoriteLocationIds: locId},
        {
        headers: {
          'Content-Type':'application/json',
        },
        withCredentials: true, // Include HTTP-only cookies in the request
      });

      console.log('Response is : ', response.data);
      fetchVenues();
    } catch (error) {
      console.error("Error deleting favorite location:", error);
    }
  };
  useEffect(() => {
  fetchVenues();
}
  , []);

  return (
    <Card className="h-full w-full">
      <CardBody className="overflow-scroll px-0">
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search by location"
            value={searchTerm}
            onChange={handleSearchChange}
            className="flex w-64"
          />
        </div>

        <table className="mt-4 w-full min-w-max table-auto text-left">
          <thead>
            <tr>
              {TABLE_HEAD.map((head, index) => (
                <th
                  key={head}
                  className="cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors hover:bg-blue-gray-50 z-50 select-none"
                  onClick={() => handleSort(head.toLowerCase())}
                >
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="flex items-center justify-between gap-2 font-normal leading-none opacity-70"
                  >
                    {head}{" "}
                    {index !== TABLE_HEAD.length - 1 && (
                      <ChevronUpDownIcon strokeWidth={2} className="h-4 w-4" />
                    )}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedData.length === 0 && (
              <tr>
                <td className="p-4 text-center" colSpan={TABLE_HEAD.length}>
                  <Typography color="gray" className="font-normal">
                    No members found.
                  </Typography>
                </td>
              </tr>
            )}
            {displayedData.map(
              ({ locId, location, number_of_events }, index) => {
                const isLast = index === displayedData.length - 1;
                const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";
                return (
                  <tr key={location}>
                    <td className={classes}>
                      <div className="flex items-center gap-3">
                        <Typography variant="small" color="blue-gray" className="font-normal">{location}</Typography>
                      </div>
                    </td>

                    <td className={classes}>
                      <Typography variant="small" color="blue-gray" className="font-normal">{number_of_events}</Typography>
                    </td>

                    <td className={classes}>
                      <Tooltip content="Remove">
                        <IconButton variant="text" 
                            onClick={(e)=>{
                              e.preventDefault();
                              removeFavLoc(locId)
                            }}>
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </CardBody>

      <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
        <div className="flex items-center space-x-2">
          <Button
            className='text-gray-500'
            onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
            disabled={currentPage === 1}
            variant="outlined"
          >
            Previous
          </Button>

          <Button
            className='text-gray-500'
            onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
            disabled={currentPage === totalPages}
            variant="outlined"
          >
            Next
          </Button>
        </div>
        <Typography variant="small" color="blue-gray" className="font-normal select-none">
          Page {currentPage} of {totalPages}
        </Typography>
      </CardFooter>
    </Card>
  );
}

export default SortableTable;