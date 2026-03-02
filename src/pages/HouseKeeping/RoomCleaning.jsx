import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import Swal from 'sweetalert2';
import { FaTimes, FaCircle, FaBroom, FaUndo } from 'react-icons/fa';
import PageHeader from '../../components/PageHeader'; 
import CustomDropdown from '../../components/CustomDropdown';
import SkeletonLoader from "../../components/SkeletonLoader"; 
import useAuth from "../../Hook/useAuth";
import { useHouseKeeper } from "../../Hook/useHousekeeper"; 
import { useRoomCategory } from "../../Hook/useRoomCategory"; 
import { useRoom } from "../../Hook/useRoom"; 
import toast from "react-hot-toast";

// --- Helper Functions ---
const formatTime = (totalSeconds) => {
  if (totalSeconds === null || totalSeconds === undefined) return '';
  const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const day = d.getDate().toString().padStart(2, '0');
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const seconds = d.getSeconds().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; 
  
  return `${day}-${month}-${year} ${hours.toString().padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
};

const RoomCleaning = () => {
  const { user } = useAuth();
  const userBranch = user?.branch || "";
  
  // Hooks
  const { getAllHouseKeepers } = useHouseKeeper();
  const { getAllRoomCategories } = useRoomCategory();
  const { getAllRooms, loading: roomsLoading } = useRoom();

  // --- State ---
  const [rooms, setRooms] = useState([]); 
  const [activeTab, setActiveTab] = useState("Room Cleaning");
  
  // Dynamic Dropdown Data States
  const [availableKeepers, setAvailableKeepers] = useState([]); 
  const [availableCategories, setAvailableCategories] = useState([]); 
  
  // Filter States
  const [filterKeeper, setFilterKeeper] = useState("All House Keepers");
  const [filterRoomType, setFilterRoomType] = useState("All Room Types");
  const [filterRoomUnit, setFilterRoomUnit] = useState("All Rooms"); 
  const [appliedFilters, setAppliedFilters] = useState({ 
    keeper: "All House Keepers", 
    roomType: "All Room Types",
    roomUnit: "All Rooms" 
  });

  // Modal State
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedKeeper, setSelectedKeeper] = useState("");

  // --- Fetch Dynamic Data (Rooms, Keepers & Categories) ---
  const loadAllData = useCallback(async () => {
    if (!userBranch) return;
    try {
      const [roomsRes, keepersRes, categoriesRes] = await Promise.all([
        getAllRooms({ page: 1, limit: 1000, branch: userBranch }),
        getAllHouseKeepers({ page: 1, limit: 1000, branch: userBranch }),
        getAllRoomCategories({ page: 1, limit: 1000, branch: userBranch }) 
      ]);

      if (keepersRes?.data) setAvailableKeepers(keepersRes.data);
      if (categoriesRes?.data) setAvailableCategories(categoriesRes.data);

      if (roomsRes?.data) {
        const initializedRooms = roomsRes.data.map(room => ({
          ...room,
          _id: room._id,
          roomUnit: room.roomName || "N/A",
          roomType: room.roomCategory?.categoryName || "STANDARD",
          status: room.houseKeepingStatus === 'Cleaned' ? 'Cleaned' : 'Dirty', 
          startedOn: null,
          timeTakenSeconds: 0,
          endedOn: null,
          houseKeeper: '',
        }));
        
        setRooms(initializedRooms);
      }

    } catch (err) {
      console.error("Failed to load data", err);
      toast.error("Failed to load initial data");
    }
  }, [getAllRooms, getAllHouseKeepers, getAllRoomCategories, userBranch]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // --- Timer Mechanism ---
  useEffect(() => {
    const interval = setInterval(() => {
      setRooms(prevRooms => 
        prevRooms.map(room => {
          if (room.status === 'Cleaning In Progress') {
            return { ...room, timeTakenSeconds: room.timeTakenSeconds + 1 };
          }
          return room;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // --- Unique Values for Dropdowns ---
  const uniqueRoomUnits = useMemo(() => {
    return [...new Set(rooms.map(r => r.roomUnit).filter(Boolean))];
  }, [rooms]);

  // --- Action Handlers ---
  const handleStartClick = (roomId) => {
    setSelectedRoomId(roomId);
    setSelectedKeeper(""); 
    setIsStartModalOpen(true);
  };

  const submitStartCleaning = () => {
    if (!selectedKeeper) return toast.error("Please select a housekeeper first.");

    const currentTime = new Date().toISOString();

    setRooms(prevRooms => prevRooms.map(room => {
      if (room._id === selectedRoomId) {
        return {
          ...room,
          status: 'Cleaning In Progress',
          houseKeeper: selectedKeeper,
          startedOn: currentTime,
          timeTakenSeconds: 0, 
          endedOn: null
        };
      }
      return room;
    }));

    toast.success("Cleaning timer started!");
    setIsStartModalOpen(false);
    setSelectedRoomId(null);
  };

  const handleEndClick = (roomId) => {
    const isDarkMode = document.documentElement.classList.contains('dark');

    Swal.fire({
      title: 'Are you sure want to end the cleaning?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#66cc00', 
      cancelButtonColor: '#3d4451',  
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      background: isDarkMode ? '#1f2937' : '#ffffff',
      color: isDarkMode ? '#f3f4f6' : '#374151',
    }).then((result) => {
      if (result.isConfirmed) {
        finalizeCleaning(roomId);
      }
    });
  };

  const finalizeCleaning = (roomId) => {
    const currentTime = new Date().toISOString();

    setRooms(prevRooms => prevRooms.map(room => {
      if (room._id === roomId) {
        return {
          ...room,
          status: 'Cleaned',
          endedOn: currentTime,
        };
      }
      return room;
    }));

    toast.success("Room marked as cleaned!");
  };

  // --- Filter Logic ---
  const handleSearch = () => {
    setAppliedFilters({ 
      keeper: filterKeeper, 
      roomType: filterRoomType,
      roomUnit: filterRoomUnit 
    });
  };

  const handleResetFilters = () => {
    setFilterKeeper("All House Keepers");
    setFilterRoomType("All Room Types");
    setFilterRoomUnit("All Rooms");
    setAppliedFilters({ 
      keeper: "All House Keepers", 
      roomType: "All Room Types",
      roomUnit: "All Rooms" 
    });
  };

  const displayedRooms = useMemo(() => {
     return rooms.filter(room => {
        const matchesKeeper = appliedFilters.keeper === "All House Keepers" || room.houseKeeper === appliedFilters.keeper;
        const matchesType = appliedFilters.roomType === "All Room Types" || room.roomType.toLowerCase() === appliedFilters.roomType.toLowerCase();
        const matchesUnit = appliedFilters.roomUnit === "All Rooms" || room.roomUnit === appliedFilters.roomUnit;
        
        return matchesKeeper && matchesType && matchesUnit;
     });
  }, [rooms, appliedFilters]);

  // Handle Select Change for CustomDropdowns
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if(name === 'roomType') setFilterRoomType(value);
    if(name === 'houseKeeper') setFilterKeeper(value);
    if(name === 'roomUnit') setFilterRoomUnit(value);
  }

  return (
    <div className="bg-[#f1f5f9] dark:bg-gray-900 min-h-screen p-4 md:p-6 text-[#1f2937] dark:text-gray-100 transition-colors duration-300 font-sans">
      <Helmet>
        <title>Room Cleaning | Admin Dashboard</title>
      </Helmet>

      <PageHeader 
        title="Room Cleaning" 
        subtitle="Manage and track active housekeeping tasks" 
        icon={<FaBroom className="text-[#66cc00]" />} 
      />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden mt-6">
        
        {/* --- Tabs --- */}
        <div className="flex border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/50 pt-4 px-4 gap-2">
          <button 
            onClick={() => setActiveTab("Room Cleaning")}
            className={`px-6 py-2.5 text-sm font-bold rounded-t-lg transition-colors ${activeTab === "Room Cleaning" ? "bg-[#66cc00] text-white shadow-sm" : "bg-slate-200 dark:bg-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-gray-600"}`}
          >
            Room Cleaning
          </button>
          <button 
            onClick={() => setActiveTab("History")}
            className={`px-6 py-2.5 text-sm font-bold rounded-t-lg transition-colors ${activeTab === "History" ? "bg-[#66cc00] text-white shadow-sm" : "bg-slate-200 dark:bg-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-gray-600"}`}
          >
            History
          </button>
        </div>

        {/* --- Top Filters --- */}
        <div className="p-5 border-b border-slate-200 dark:border-gray-700 flex flex-wrap items-center gap-4">
          
          <CustomDropdown 
            name="roomUnit"
            value={filterRoomUnit}
            onChange={handleFilterChange}
            defaultLabel="All Rooms"
            options={uniqueRoomUnits.map(unit => ({ value: unit, label: unit }))}
            className="min-w-[180px]"
          />

          <CustomDropdown 
            name="roomType"
            value={filterRoomType}
            onChange={handleFilterChange}
            defaultLabel="All Room Types"
            options={availableCategories.map(cat => ({ value: cat.categoryName || cat.name, label: cat.categoryName || cat.name }))}
            className="min-w-[200px]"
          />

          <CustomDropdown 
            name="houseKeeper"
            value={filterKeeper}
            onChange={handleFilterChange}
            defaultLabel="All House Keepers"
            options={availableKeepers.map(hk => ({ value: hk.name, label: hk.name }))}
            className="min-w-[200px]"
          />

          <div className="flex gap-2 w-full sm:w-auto md:ml-auto">
            <button 
              onClick={handleResetFilters}
              title="Reset Filters"
              className="bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 text-[#3d4451] dark:text-gray-200 px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center justify-center"
            >
              <FaUndo size={14} />
            </button>
            <button 
              onClick={handleSearch}
              className="flex-1 sm:flex-none bg-[#3d4451] hover:bg-[#1f2937] text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* --- Main Table --- */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-200/80 dark:bg-gray-700 text-[#3d4451] dark:text-gray-100 font-bold border-b border-slate-300 dark:border-gray-600">
                <th className="px-5 py-4 text-left uppercase text-xs">Room/Unit</th>
                <th className="px-5 py-4 text-left uppercase text-xs">Room Type</th>
                <th className="px-5 py-4 text-left uppercase text-xs w-40">Status</th>
                <th className="px-5 py-4 text-left uppercase text-xs w-48">Started On</th>
                <th className="px-5 py-4 text-left uppercase text-xs">Time Taken</th>
                <th className="px-5 py-4 text-left uppercase text-xs w-48">Ended On</th>
                <th className="px-5 py-4 text-left uppercase text-xs">Housekeeper</th>
                <th className="px-5 py-4 text-center uppercase text-xs w-24">Check-In</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {roomsLoading ? (
                <tr><td colSpan="8" className="py-20 text-center"><SkeletonLoader /></td></tr>
              ) : displayedRooms.length === 0 ? (
                <tr><td colSpan="8" className="py-12 text-center text-slate-500 font-medium">No matching rooms found.</td></tr>
              ) : (
                displayedRooms.map((room) => {
                  
                  // Determine Status UI
                  let statusColor = "text-[#66cc00]"; // Cleaned default
                  let dotColor = "text-[#66cc00]";

                  if (room.status === 'Dirty') {
                    statusColor = "text-slate-500 dark:text-slate-300";
                    dotColor = "text-yellow-400";
                  } else if (room.status === 'Cleaning In Progress') {
                    statusColor = "text-slate-500 dark:text-slate-300";
                    dotColor = "text-[#37cdbe]"; // Accent color for progress
                  }

                  return (
                    <tr key={room._id} className="hover:bg-slate-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-5 py-4 font-bold text-[#1f2937] dark:text-gray-200 whitespace-nowrap">
                        {room.roomUnit}
                      </td>
                      <td className="px-5 py-4 text-[#3d4451] dark:text-slate-300 font-medium uppercase text-xs whitespace-nowrap">
                        {room.roomType}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`flex items-center gap-2 font-medium text-sm ${statusColor}`}>
                          <FaCircle className={`${dotColor} text-[10px]`} /> {room.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-[#3d4451] dark:text-gray-300 whitespace-nowrap">
                        {room.status === 'Dirty' ? (
                          <button 
                            onClick={() => handleStartClick(room._id)}
                            className="bg-[#66cc00] hover:bg-[#336600] text-white px-5 py-1.5 rounded-full font-bold transition-colors shadow-sm"
                          >
                            Start
                          </button>
                        ) : (
                          formatDate(room.startedOn)
                        )}
                      </td>
                      <td className="px-5 py-4 font-bold text-[#3d4451] dark:text-gray-300 whitespace-nowrap">
                        {formatTime(room.timeTakenSeconds)}
                      </td>
                      <td className="px-5 py-4 text-xs text-[#3d4451] dark:text-gray-300 whitespace-nowrap">
                        {room.status === 'Cleaning In Progress' ? (
                          <button 
                            onClick={() => handleEndClick(room._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-5 py-1.5 rounded-full font-bold transition-colors shadow-sm"
                          >
                            End
                          </button>
                        ) : (
                          formatDate(room.endedOn)
                        )}
                      </td>
                      <td className="px-5 py-4 text-[#3d4451] dark:text-gray-300 font-medium text-sm whitespace-nowrap">
                        {room.houseKeeper}
                      </td>
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <button className="bg-[#dc2626] hover:bg-red-700 text-white px-4 py-1.5 rounded-md text-xs font-bold transition-colors shadow-sm">
                          Clear
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Start Cleaning Modal --- */}
      {isStartModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/40 backdrop-blur-sm transition-opacity" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-[#3d4451] dark:text-gray-100">Start Cleaning</h3>
              <button 
                onClick={() => setIsStartModalOpen(false)}
                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition-colors"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <label className="text-sm font-bold text-slate-500 dark:text-slate-400 w-24 text-right">Housekeeper</label>
                
                <CustomDropdown 
                  name="modalKeeper"
                  value={selectedKeeper}
                  onChange={(e) => setSelectedKeeper(e.target.value)}
                  defaultLabel="Select Housekeeper"
                  options={availableKeepers.map(hk => ({ value: hk.name, label: hk.name }))}
                  className="flex-1 max-w-none"
                />

              </div>

              <div className="flex justify-center">
                <button 
                  onClick={submitStartCleaning}
                  disabled={!selectedKeeper}
                  className="bg-[#66cc00] hover:bg-[#336600] disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold shadow-md transition-all"
                >
                  Start Cleaning
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default RoomCleaning;