// TableReservationManager.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet";
import SkeletonLoader from "../../components/SkeletonLoader";
import useAuth from "../../Hook/useAuth";
import { getPaginationRange } from "../../utilities/paginationUtils";
import { useTableReservation } from "../../Hook/useTableReservation";
import PageHeader from "../../components/PageHeader";
import CountInfoJson from "../../assets/Json/Country.json";
import TimeJson from '../../assets/Json/time.json';

import {
  FaEdit, FaTrash, FaTimes, FaChevronLeft,
  FaChevronRight, FaExclamationCircle, FaTable
} from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 15, 20, 50];

const defaultFormState = {
  outlet: "",
  date: new Date().toISOString().split('T')[0],
  time: "",
  guestName: "",
  phoneCode: "+880",
  phoneNumber: "",
  email: "",
  city: "",
  guestCount: 0
};

const TableReservationManager = () => {
  const { user } = useAuth();
  const userBranch = user?.branch || "";

  const {
    getAllReservations,
    createReservation,
    updateReservation,
    removeReservation,
    loading
  } = useTableReservation();

  const [reservationList, setReservationList] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterOutlet, setFilterOutlet] = useState("All Outlets");
  
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(defaultFormState);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (debouncedSearch !== searchInput) {
        setDebouncedSearch(searchInput);
        setCurrentPage(1);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput, debouncedSearch]);

  const loadReservations = useCallback(async () => {
    if (!userBranch) return;
    try {
      const data = await getAllReservations({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch,
        branch: userBranch
      });
      if (data) {
        let filteredData = data.data || [];
        if (filterDate) {
          filteredData = filteredData.filter(item => item.date === filterDate);
        }
        if (filterOutlet !== "All Outlets") {
           filteredData = filteredData.filter(item => item.outlet === filterOutlet);
        }

        setReservationList(filteredData);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.totalDocuments || 0);
      }
    } catch (error) {
      console.error("Load error:", error);
    }
  }, [getAllReservations, currentPage, itemsPerPage, debouncedSearch, userBranch, filterDate, filterOutlet]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const handleOpenModal = useCallback((reservation = null) => {
    setErrors({});
    if (reservation) {
      setEditingId(reservation._id);
      
      let parsedCode = "+880";
      let parsedNum = reservation.phoneNumber || "";
      
      const matchedCountry = CountInfoJson.find(c => parsedNum.startsWith(c['Phone Code']));
      if (matchedCountry) {
        parsedCode = matchedCountry['Phone Code'];
        parsedNum = parsedNum.substring(parsedCode.length);
        
        if (parsedCode === "+880" && !parsedNum.startsWith("0")) {
          parsedNum = "0" + parsedNum;
        }
      }

      setFormData({
        outlet: reservation.outlet || "",
        date: reservation.date || "",
        time: reservation.time || "",
        guestName: reservation.guestName || "",
        phoneCode: parsedCode,
        phoneNumber: parsedNum,
        email: reservation.email || "",
        city: reservation.city || "",
        guestCount: reservation.guestCount || 0
      });
    } else {
      setEditingId(null);
      setFormData(defaultFormState);
    }
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => {
      setEditingId(null);
      setFormData(defaultFormState);
      setErrors({});
    }, 200);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    // Using optional chaining just in case a field is somehow undefined
    if (!formData.outlet?.trim()) newErrors.outlet = "Outlet is required.";
    if (!formData.date?.trim()) newErrors.date = "Date is required.";
    if (!formData.time?.trim()) newErrors.time = "Time is required.";
    if (!formData.guestName?.trim()) newErrors.guestName = "Guest Name is required.";
    if (!formData.phoneNumber?.trim()) newErrors.phoneNumber = "Phone Number is required.";
    
    // Temporarily disabled the strict BD Regex validation just to make sure it isn't blocking you
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. CHECK FOR USER BRANCH
    if (!userBranch) {
      window.alert("FRONTEND STOPPED: Your logged-in user does not have a 'branch' assigned! The database requires a branch to save a reservation.");
      return;
    }

    // 2. CHECK FOR FORM ERRORS
    if (!validateForm()) {
      window.alert("FRONTEND STOPPED: You are missing required fields. Check the red text under the input boxes.");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalPhone = formData.phoneNumber.trim();
      if (formData.phoneCode === "+880" && finalPhone.startsWith("0")) {
        finalPhone = finalPhone.substring(1);
      }
      const mergedPhoneNumber = formData.phoneCode + finalPhone;

      const payload = { 
        ...formData, 
        branch: userBranch,
        phoneNumber: mergedPhoneNumber,
        guestCount: Number(formData.guestCount)
      };
      
      delete payload.phoneCode;

      if (editingId) {
        await updateReservation(editingId, payload);
        toast.success("Reservation updated successfully");
      } else {
        await createReservation(payload);
        toast.success("Reservation created successfully");
      }
      handleCloseModal();
      loadReservations();
    } catch (err) {
      // 3. CHECK FOR BACKEND ERRORS
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      window.alert("BACKEND ERROR: The server rejected the save. Reason: " + errorMsg);
      console.error("Submission Error:", err.response?.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = useCallback(async (id) => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    const result = await Swal.fire({
      title: "Confirm Deletion",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#3d4451",
      confirmButtonText: "Yes, delete",
      background: isDarkMode ? "#1f2937" : "#fff",
      color: isDarkMode ? "#f3f4f6" : "#374151"
    });

    if (result.isConfirmed) {
      try {
        await removeReservation(id);
        toast.success("Deleted successfully");
        if (reservationList.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else {
          loadReservations();
        }
      } catch (err) {
        toast.error(err.response?.data?.error || err.response?.data?.message || "Delete failed");
      }
    }
  }, [removeReservation, loadReservations, reservationList.length, currentPage]);

  const paginationRange = useMemo(() => getPaginationRange(currentPage, totalPages), [currentPage, totalPages]);

  return (
    <div className="bg-[#f1f5f9] dark:bg-gray-900 min-h-screen p-4 md:p-6 text-[#1f2937] dark:text-gray-100 font-sans">
      <Helmet>
        <title>Table Reservations | Dashboard</title>
      </Helmet>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <PageHeader 
          title="Table Reservations" 
          subtitle="Manage restaurant and outlet table bookings" 
          icon={<FaTable className="text-[#66cc00]" />} 
        />
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#66cc00] hover:bg-[#336600] text-white px-6 py-2 rounded text-sm font-bold shadow-sm transition-colors"
        >
          Create
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded shadow-sm overflow-hidden mb-6">
        {/* Search & Filter Top Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-end md:items-center">
          <div className="flex flex-col w-full md:w-auto">
            <label className="text-xs font-semibold text-slate-500 mb-1">Date</label>
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00]" 
            />
          </div>
          
          <div className="flex flex-col w-full md:w-auto">
            <label className="text-xs font-semibold text-slate-500 mb-1">Outlet</label>
            <select 
              value={filterOutlet}
              onChange={(e) => setFilterOutlet(e.target.value)}
              className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] w-full md:w-48"
            >
              <option value="All Outlets">All Outlets</option>
              <option value="Main Restaurant">Main Restaurant</option>
              <option value="Coffee Shop">Coffee Shop</option>
            </select>
          </div>

          <button 
            onClick={loadReservations}
            className="bg-[#66cc00] hover:bg-[#336600] text-white px-5 py-1.5 rounded text-sm transition-colors mb-[1px]"
          >
            Search
          </button>
        </div>

        {/* Global Search & Rows per page */}
        <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700">
           <input
              type="search"
              placeholder="Search in records..."
              className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-1.5 text-sm w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-[#66cc00]"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
           />
           <div className="flex items-center gap-2">
             <span className="text-xs font-semibold text-slate-500">Rows:</span>
             <select
               className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-2 py-1 text-xs focus:outline-none"
               value={itemsPerPage}
               onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
             >
               {ITEMS_PER_PAGE_OPTIONS.map((opt) => (
                 <option key={opt} value={opt}>{opt}</option>
               ))}
             </select>
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto p-4 min-h-[300px]">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#d1d5db] dark:bg-gray-700 text-[#374151] dark:text-gray-100 font-bold border border-slate-300 dark:border-gray-600">
                <th className="px-4 py-2 text-left border border-slate-300 dark:border-gray-600">Id</th>
                <th className="px-4 py-2 text-left border border-slate-300 dark:border-gray-600">Guest Name</th>
                <th className="px-4 py-2 text-left border border-slate-300 dark:border-gray-600">Phone</th>
                <th className="px-4 py-2 text-left border border-slate-300 dark:border-gray-600">Email</th>
                <th className="px-4 py-2 text-left border border-slate-300 dark:border-gray-600">City</th>
                <th className="px-4 py-2 text-left border border-slate-300 dark:border-gray-600">Count</th>
                <th className="px-4 py-2 text-left border border-slate-300 dark:border-gray-600">Booking For</th>
                <th className="px-4 py-2 text-right border border-slate-300 dark:border-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="py-10"><SkeletonLoader /></td></tr>
              ) : reservationList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate-500 border-x border-b border-slate-200 dark:border-gray-700">
                    No Record(s) Found
                  </td>
                </tr>
              ) : (
                reservationList.map((row, idx) => (
                  <tr key={row._id} className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors border-b border-slate-200 dark:border-gray-700">
                    <td className="px-4 py-2 border-x border-slate-200 dark:border-gray-700">{idx + 1}</td>
                    <td className="px-4 py-2 border-x border-slate-200 dark:border-gray-700">{row.guestName}</td>
                    <td className="px-4 py-2 border-x border-slate-200 dark:border-gray-700">{row.phoneNumber}</td>
                    <td className="px-4 py-2 border-x border-slate-200 dark:border-gray-700">{row.email || "-"}</td>
                    <td className="px-4 py-2 border-x border-slate-200 dark:border-gray-700">{row.city || "-"}</td>
                    <td className="px-4 py-2 border-x border-slate-200 dark:border-gray-700">{row.guestCount}</td>
                    <td className="px-4 py-2 border-x border-slate-200 dark:border-gray-700">{row.date} {row.time}</td>
                    <td className="px-4 py-2 border-x border-slate-200 dark:border-gray-700 text-right">
                      <button onClick={() => handleOpenModal(row)} className="text-slate-500 hover:text-[#66cc00] mr-3"><FaEdit size={14}/></button>
                      <button onClick={() => handleDelete(row._id)} className="text-red-400 hover:text-red-500"><FaTrash size={14}/></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalItems > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 dark:border-gray-700 flex justify-between items-center text-sm text-slate-500">
            <div>Showing {reservationList.length} of {totalItems} Results</div>
            <div className="flex gap-1">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-2 py-1 border rounded hover:bg-slate-50 disabled:opacity-50"><FaChevronLeft size={10}/></button>
              {paginationRange.map((num, i) => (
                <button key={i} onClick={() => num !== "..." && setCurrentPage(num)} className={`px-2 py-1 border rounded ${currentPage === num ? 'bg-[#66cc00] text-white' : 'hover:bg-slate-50'}`}>
                  {num}
                </button>
              ))}
              <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-2 py-1 border rounded hover:bg-slate-50 disabled:opacity-50"><FaChevronRight size={10}/></button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded shadow-2xl overflow-hidden flex flex-col">
            
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-200">Table Reservation</h3>
              <button type="button" onClick={handleCloseModal} className="text-red-500 hover:text-red-700"><FaTimes size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col p-6 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Outlet</label>
                  <select name="outlet" value={formData.outlet} onChange={handleInputChange} className={`w-full border ${errors.outlet ? 'border-red-500' : 'border-slate-300 dark:border-gray-600'} rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] bg-white dark:bg-gray-700`}>
                    <option value="">Select</option>
                    <option value="Main Restaurant">Main Restaurant</option>
                    <option value="Coffee Shop">Coffee Shop</option>
                  </select>
                  {errors.outlet && <p className="text-red-500 text-[10px] mt-1"><FaExclamationCircle className="inline" /> {errors.outlet}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Date</label>
                  <input type="date" name="date" value={formData.date} onChange={handleInputChange} className={`w-full border ${errors.date ? 'border-red-500' : 'border-slate-300 dark:border-gray-600'} rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] bg-white dark:bg-gray-700`} />
                  {errors.date && <p className="text-red-500 text-[10px] mt-1"><FaExclamationCircle className="inline" /> {errors.date}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Time</label>
                  <select name="time" value={formData.time} onChange={handleInputChange} className={`w-full border ${errors.time ? 'border-red-500' : 'border-slate-300 dark:border-gray-600'} rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] bg-white dark:bg-gray-700`}>
                    <option value="">Select</option>
                    {TimeJson.map((t, index) => (
                      <option key={`time-${index}`} value={typeof t === 'string' ? t : t.time || t}>
                        {typeof t === 'string' ? t : t.time || t}
                      </option>
                    ))}
                  </select>
                  {errors.time && <p className="text-red-500 text-[10px] mt-1"><FaExclamationCircle className="inline" /> {errors.time}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Guest Name</label>
                  <input type="text" name="guestName" value={formData.guestName} onChange={handleInputChange} className={`w-full border ${errors.guestName ? 'border-red-500' : 'border-slate-300 dark:border-gray-600'} rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] bg-white dark:bg-gray-700`} />
                  {errors.guestName && <p className="text-red-500 text-[10px] mt-1"><FaExclamationCircle className="inline" /> {errors.guestName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Phone Number</label>
                  <div className="flex gap-2">
                    <select name="phoneCode" value={formData.phoneCode} onChange={handleInputChange} className="w-24 border border-slate-300 dark:border-gray-600 rounded px-2 py-2 text-sm focus:outline-none bg-white dark:bg-gray-700">
                      {CountInfoJson.map((item, index) => (
                        <option key={`code-${index}`} value={item['Phone Code']}>
                          {item['Phone Code']}
                        </option>
                      ))}
                    </select>
                    <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder={formData.phoneCode === "+880" ? "01XXXXXXXXX" : ""} className={`w-full border ${errors.phoneNumber ? 'border-red-500' : 'border-slate-300 dark:border-gray-600'} rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] bg-white dark:bg-gray-700`} />
                  </div>
                  {errors.phoneNumber && <p className="text-red-500 text-[10px] mt-1"><FaExclamationCircle className="inline" /> {errors.phoneNumber}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border border-slate-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] bg-white dark:bg-gray-700" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full border border-slate-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] bg-white dark:bg-gray-700" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Guest Count</label>
                  <input type="number" min="0" name="guestCount" value={formData.guestCount} onChange={handleInputChange} className="w-full border border-slate-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] bg-white dark:bg-gray-700" />
                </div>
              </div>

              <div className="flex justify-center pt-6">
                <button type="submit" disabled={isSubmitting} className="bg-[#66cc00] hover:bg-[#336600] text-white px-8 py-2 rounded text-sm font-semibold transition-colors shadow-sm disabled:opacity-60">
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TableReservationManager;