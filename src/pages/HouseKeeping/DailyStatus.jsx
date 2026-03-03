import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet";
import { useRoom } from "../../Hook/useRoom"; 
import { useHouseKeepingStatus } from "../../Hook/useHouseKeepingStatus"; 
import { useHouseKeeper } from "../../Hook/useHousekeeper"; 
import SkeletonLoader from "../../components/SkeletonLoader";
import PageHeader from "../../components/PageHeader";
import CustomDropdown from "../../components/CustomDropdown"; // Import the new component
import useAuth from "../../Hook/useAuth";
import { 
  FaPrint, FaAngleDown, FaCircle, FaClipboardList
} from "react-icons/fa";
import toast from "react-hot-toast";

const DailyStatus = () => {
  const { user } = useAuth();
  const userBranch = user?.branch || "";

  // Hooks for fetching data
  const { getAllRooms, loading: roomsLoading } = useRoom();
  const { getAllHouseKeepingStatuses } = useHouseKeepingStatus();
  const { getAllHouseKeepers } = useHouseKeeper();

  // --- State Management ---
  const [roomsList, setRoomsList] = useState([]);
  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [availableKeepers, setAvailableKeepers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [bulkOperation, setBulkOperation] = useState("");

  // Filters State
  const [filters, setFilters] = useState({
    houseType: "All House Type",
    status: "All Status",
    availability: "All Availability",
    roomType: "All Room Types",
    houseKeeper: "All House Keepers"
  });

  // State to hold the applied filters (updates only on "Search" click)
  const [appliedFilters, setAppliedFilters] = useState({ ...filters });

  // --- Data Fetching ---
  const loadInitialData = useCallback(async () => {
    if (!userBranch) return; 

    try {
      // Fetch Rooms 
      const roomsRes = await getAllRooms({ page: 1, limit: 500, branch: userBranch });
      if (roomsRes?.data) setRoomsList(roomsRes.data);

      // Fetch Dropdowns
      const statusesRes = await getAllHouseKeepingStatuses({ page: 1, limit: 100, branch: userBranch });
      const keepersRes = await getAllHouseKeepers({ page: 1, limit: 100, branch: userBranch });

      if (Array.isArray(statusesRes)) setAvailableStatuses(statusesRes);
      else if (statusesRes?.data) setAvailableStatuses(statusesRes.data);

      if (keepersRes?.data) setAvailableKeepers(keepersRes.data);

    } catch (error) {
      toast.error("Failed to load daily status data");
    }
  }, [getAllRooms, getAllHouseKeepingStatuses, getAllHouseKeepers, userBranch]);

  useEffect(() => { 
    loadInitialData(); 
  }, [loadInitialData]);

  // --- Extract Data Logic for Rows ---
  const getRowData = (room) => {
    const roomType = room.roomCategory?.categoryName || "STANDARD ROOM";
    const status = room.bookingStatus === 'vacant' ? 'Clear' : 'Cleaned';
    const availability = room.bookingStatus === 'occupied' ? 'Due Out' : 'Vacant';
    const houseKeeper = "House Keeper A"; // Mocked assignment
    
    return { roomType, status, availability, houseKeeper };
  };

  // --- Unique Values for Dropdowns ---
  const uniqueRoomTypes = useMemo(() => {
    return [...new Set(roomsList.map(r => r.roomCategory?.categoryName || "STANDARD ROOM"))];
  }, [roomsList]);

  // Static Availability Options
  const availabilityOptions = ["Vacant", "Occupied", "Due Out"];

  // --- Perfect Filtering Mechanism ---
  const filteredRooms = useMemo(() => {
    return roomsList.filter((room) => {
      const rowData = getRowData(room);

      const matchesRoomType = appliedFilters.roomType === "All Room Types" || 
                              rowData.roomType.toLowerCase() === appliedFilters.roomType.toLowerCase();
                              
      const matchesStatus = appliedFilters.status === "All Status" || 
                            rowData.status.toLowerCase() === appliedFilters.status.toLowerCase();
                            
      const matchesAvailability = appliedFilters.availability === "All Availability" || 
                                  rowData.availability.toLowerCase() === appliedFilters.availability.toLowerCase();
                                  
      const matchesHouseKeeper = appliedFilters.houseKeeper === "All House Keepers" || 
                                 rowData.houseKeeper.toLowerCase() === appliedFilters.houseKeeper.toLowerCase();

      return matchesRoomType && matchesStatus && matchesAvailability && matchesHouseKeeper;
    });
  }, [roomsList, appliedFilters]);

  // --- Handlers ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    setAppliedFilters({ ...filters }); 
    setSelectedRows([]); 
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(filteredRooms.map(room => room._id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-[#f1f5f9] dark:bg-gray-900 min-h-screen p-4 md:p-6 lg:p-8 text-[#1f2937] dark:text-gray-100 transition-colors duration-300 font-sans">
      
      <Helmet>
        <title>Daily Status | Admin Dashboard</title>
      </Helmet>

      {/* --- Page Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <PageHeader 
          title="Daily Status" 
          subtitle="Overview of room housekeeping and availability statuses" 
          icon={<FaClipboardList className="text-[#66cc00]" />} 
        />
        <button 
          onClick={handlePrint}
          className="bg-[#37cdbe] hover:bg-[#2fb0a2] text-white px-5 py-2 rounded shadow transition-all flex items-center gap-2 font-medium"
        >
          <FaPrint /> Print Report
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-gray-800 rounded shadow-md border border-slate-200 dark:border-gray-700 overflow-hidden w-full">
        
        {/* --- Filter Top Bar --- */}
        <div className="p-4 border-b border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex flex-wrap items-center gap-4">
            
            <CustomDropdown 
              name="houseType" 
              value={filters.houseType} 
              onChange={handleFilterChange} 
              defaultLabel="All House Type" 
              options={[]} 
            />

            <CustomDropdown 
              name="status" 
              value={filters.status} 
              onChange={handleFilterChange} 
              defaultLabel="All Status" 
              options={availableStatuses} 
            />

            <CustomDropdown 
              name="availability" 
              value={filters.availability} 
              onChange={handleFilterChange} 
              defaultLabel="All Availability" 
              options={availabilityOptions} 
            />

            <CustomDropdown 
              name="roomType" 
              value={filters.roomType} 
              onChange={handleFilterChange} 
              defaultLabel="All Room Types" 
              options={uniqueRoomTypes} 
            />

            <CustomDropdown 
              name="houseKeeper" 
              value={filters.houseKeeper} 
              onChange={handleFilterChange} 
              defaultLabel="All House Keepers" 
              options={availableKeepers} 
              className="min-w-[180px]"
            />

            <button 
              onClick={handleSearch} 
              className="w-full sm:w-auto bg-[#66cc00] hover:bg-[#336600] text-white px-8 py-2 rounded text-sm font-medium transition-colors md:ml-auto"
            >
              Search
            </button>

          </div>
        </div>

        {/* --- Operations Bar --- */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-gray-700 flex flex-wrap items-center gap-4 bg-white dark:bg-gray-800">
           <CustomDropdown 
              value={bulkOperation} 
              onChange={(e) => setBulkOperation(e.target.value)} 
              defaultLabel="Select Bulk Operation" 
              options={[{ value: 'clean', label: 'Mark as Cleaned' }, { value: 'dirty', label: 'Mark as Dirty' }]} 
              className="min-w-[200px]"
            />
          <button className="w-full sm:w-auto bg-[#3d4451] hover:bg-[#1f2937] text-white px-5 py-1.5 rounded text-sm font-medium transition-colors shadow-sm">
            Operations History
          </button>
        </div>

        {/* --- Data Table --- */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#66cc00] text-white font-bold tracking-wide text-xs">
                <th className="px-4 py-3 w-12 text-center whitespace-nowrap">
                   <input 
                     type="checkbox" 
                     className="w-4 h-4 rounded border-white/50 accent-[#336600] cursor-pointer align-middle"
                     checked={selectedRows.length === filteredRooms.length && filteredRooms.length > 0}
                     onChange={handleSelectAll}
                   />
                </th>
                <th className="px-4 py-3 text-left whitespace-nowrap uppercase">Room/Unit</th>
                <th className="px-4 py-3 text-left whitespace-nowrap uppercase">Room Type</th>
                <th className="px-4 py-3 text-left whitespace-nowrap uppercase">Status</th>
                <th className="px-4 py-3 text-left whitespace-nowrap uppercase">Availability</th>
                <th className="px-4 py-3 text-left whitespace-nowrap uppercase">FO Remarks</th>
                <th className="px-4 py-3 text-left whitespace-nowrap uppercase">HK Remarks</th>
                <th className="px-4 py-3 text-left whitespace-nowrap uppercase w-48">Housekeeper</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {roomsLoading ? (
                <tr><td colSpan="8" className="py-24 text-center"><SkeletonLoader /></td></tr>
              ) : filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-slate-500 font-medium">No matching rooms found for the selected filters.</td>
                </tr>
              ) : (
                filteredRooms.map((room) => {
                  const isSelected = selectedRows.includes(room._id);
                  const rowData = getRowData(room);
                  
                  const statusColor = rowData.status === 'Cleaned' ? 'text-[#66cc00]' : 'text-[#66cc00]';
                  const availColor = rowData.availability === 'Due Out' ? 'text-red-500' : 'text-[#37cdbe]'; 

                  return (
                    <tr key={room._id} className={`hover:bg-slate-50 dark:hover:bg-gray-700/30 transition-colors ${isSelected ? 'bg-[#66cc00]/5 dark:bg-[#66cc00]/10' : ''}`}>
                      <td className="px-4 py-3 text-center align-middle border-r border-slate-100 dark:border-gray-700/50">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-gray-300 accent-[#66cc00] cursor-pointer align-middle transition-all"
                          checked={isSelected}
                          onChange={() => handleSelectRow(room._id)}
                        />
                      </td>
                      <td className="px-4 py-3 font-bold text-[#1f2937] dark:text-gray-200 align-middle whitespace-nowrap">
                        {room.roomName}
                      </td>
                      <td className="px-4 py-3 text-[#3d4451] dark:text-slate-300 font-semibold uppercase text-[11px] tracking-wider align-middle whitespace-nowrap">
                        {rowData.roomType}
                      </td>
                      <td className="px-4 py-3 align-middle whitespace-nowrap">
                        <span className={`flex items-center gap-1.5 font-bold text-sm ${statusColor}`}>
                          <FaCircle className="text-[8px]" /> {rowData.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle whitespace-nowrap">
                        <span className={`flex items-center gap-1.5 font-bold text-sm ${availColor}`}>
                          <FaCircle className="text-[8px]" /> {rowData.availability}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 font-medium align-middle whitespace-nowrap">
                        {/* Mock FO Remark */}
                        {room.roomName === "104" ? "Clean" : ""}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#3d4451] dark:text-slate-300 font-medium max-w-[220px] align-middle">
                         <div className="flex flex-col gap-1 group cursor-pointer">
                            <span className="truncate leading-snug">Please check inventory and damages</span>
                            <FaAngleDown className="text-slate-400 group-hover:text-[#66cc00] transition-colors" />
                         </div>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center justify-between gap-2 group cursor-pointer bg-slate-50 dark:bg-gray-700/50 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors">
                          <span className="text-sm font-medium text-[#1f2937] dark:text-gray-200 truncate">
                            {rowData.houseKeeper}
                          </span>
                          <FaAngleDown className="text-slate-400 group-hover:text-[#66cc00]" size={12} />
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default DailyStatus;