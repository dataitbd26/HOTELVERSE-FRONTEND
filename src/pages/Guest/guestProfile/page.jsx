import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet";
import { useGuest } from "../../../Hook/useGuest"; 
import SkeletonLoader from "../../../components/SkeletonLoader";
import useAuth from "../../../Hook/useAuth";
import { getPaginationRange } from "../../../utilities/paginationUtils";
import PageHeader from "../../../components/PageHeader";

// JSON Data Imports
import Disctric from "../../../assets/Json/District.json";
import CountrAndCode from "../../../assets/Json/Country.json";
import identityType from "../../../assets/Json/Identity.json";

import { 
  FaEdit, FaTrash, FaPlus, FaTimes, 
  FaChevronLeft, FaChevronRight, FaExclamationCircle, FaUserFriends,
  FaPhone, FaEnvelope, FaIdCard, FaStar
} from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 15, 20, 50];

// Updated Default form state for Bangladesh Region
const defaultFormState = {
  guestNamePrefix: "Mr.",
  guestName: "",
  photo: "",
  phoneCode: "+880", // Default BD Phone Code
  phoneNumber: "",
  email: "",
  address1: "",
  address2: "",
  city: "",
  district: "",
  state: "",
  postCode: "",
  country: "Bangladesh", // Default BD Country
  guestType: "Adult",
  dob: "",
  gender: "",
  nationality: "Bangladeshi", // Default BD Nationality
  identityType: "",
  idNumber: "",
  organisation: "",
  isVip: false,
  preferenceNotes: ""
};

const GuestManager = () => {
  const { user } = useAuth();
  const userBranch = user?.branch || "";

  const { 
    getAllGuests, 
    createGuest, 
    updateGuest, 
    removeGuest, 
    loading 
  } = useGuest();

  // State Management
  const [guestList, setGuestList] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(defaultFormState);

  // --- Search Debounce Logic ---
  useEffect(() => {
    const handler = setTimeout(() => {
      if (debouncedSearch !== searchInput) {
        setDebouncedSearch(searchInput);
        setCurrentPage(1); 
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput, debouncedSearch]);

  // --- Data Fetching ---
  const loadGuests = useCallback(async () => {
    if (!userBranch) return; 

    try {
      const data = await getAllGuests({ 
        page: currentPage, 
        limit: itemsPerPage, 
        search: debouncedSearch,
        branch: userBranch 
      });
      
      if (data) {
        setGuestList(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.totalDocuments || 0);
      }
    } catch (error) {
      toast.error("Failed to load guests");
    }
  }, [getAllGuests, currentPage, itemsPerPage, debouncedSearch, userBranch]);

  useEffect(() => { 
    loadGuests(); 
  }, [loadGuests]);

  // --- Handlers ---
  const handleOpenModal = useCallback((guest = null) => {
    setErrors({}); 
    if (guest) {
      setEditingId(guest._id);
      setFormData({
        guestNamePrefix: guest.guestNamePrefix || "Mr.",
        guestName: guest.guestName || "",
        photo: guest.photo || "",
        phoneCode: guest.phoneCode || "+880", // Default BD
        phoneNumber: guest.phoneNumber || "",
        email: guest.email || "",
        address1: guest.address1 || "",
        address2: guest.address2 || "",
        city: guest.city || "",
        district: guest.district || "",
        state: guest.state || "",
        postCode: guest.postCode || "",
        country: guest.country || "Bangladesh", // Default BD
        guestType: guest.guestType || "Adult",
        dob: guest.dob || "",
        gender: guest.gender || "",
        nationality: guest.nationality || "Bangladeshi", // Default BD
        identityType: guest.identityType || "",
        idNumber: guest.idNumber || "",
        organisation: guest.organisation || "",
        isVip: guest.isVip || false,
        preferenceNotes: guest.preferenceNotes || ""
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
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Reset district if country changes away from Bangladesh
    if (name === "country" && value !== "Bangladesh") {
      setFormData(prev => ({ ...prev, district: "" }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.guestName.trim()) newErrors.guestName = "Guest Name is required.";
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone Number is required.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userBranch) return toast.error("User branch not found. Please log in again.");
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = { ...formData, branch: userBranch };
      
      if (editingId) {
        await updateGuest(editingId, payload);
        toast.success("Guest updated successfully");
      } else {
        await createGuest(payload);
        toast.success("Guest created successfully");
      }
      
      handleCloseModal();
      loadGuests();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Execution failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = useCallback(async (id) => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    const result = await Swal.fire({
      title: "Confirm Deletion",
      text: "This action cannot be undone. It will remove the guest record.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#3d4451",
      confirmButtonText: "Yes, delete",
      background: isDarkMode ? '#1f2937' : '#fff',
      color: isDarkMode ? '#f3f4f6' : '#374151',
    });

    if (result.isConfirmed) {
      try {
        await removeGuest(id);
        toast.success("Deleted successfully");
        if (guestList.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          loadGuests();
        }
      } catch (err) { 
        toast.error(err.response?.data?.error || err.response?.data?.message || "Delete failed"); 
      }
    }
  }, [removeGuest, loadGuests, guestList.length, currentPage]);

  const paginationRange = useMemo(() => 
    getPaginationRange(currentPage, totalPages), 
  [currentPage, totalPages]);

  return (
    <div className="bg-[#f1f5f9] dark:bg-gray-900 min-h-screen p-4 md:p-6 text-[#1f2937] dark:text-gray-100 transition-colors duration-300 relative overflow-hidden font-sans">
      
      <Helmet>
        <title>Guest Profiles | Admin Dashboard</title>
        <meta name="description" content="Manage hotel guests, communications, and identity." />
      </Helmet>

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <PageHeader 
          title="Guest Profiles" 
          subtitle="Manage guest profiles and details" 
          icon={<FaUserFriends className="text-[#66cc00]" />} 
        />
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#66cc00] hover:bg-[#336600] text-white px-6 py-2 rounded text-sm font-bold shadow-sm flex items-center gap-2 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#66cc00]"
        >
          <FaPlus size={12} aria-hidden="true" /> Add Guest
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded shadow-md border border-slate-200 dark:border-gray-700 overflow-hidden">
        
        {/* Search & Filter */}
        <div className="p-5 border-b border-slate-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
            
            {/* Search Box */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label htmlFor="searchGuest" className="text-sm font-bold hidden sm:block">Search</label>
              <input 
                id="searchGuest"
                type="search"
                className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-1.5 text-sm w-full sm:w-64 focus:ring-1 focus:ring-[#66cc00] outline-none transition-all"
                placeholder="Search name, phone, email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
             <label htmlFor="rowsPerPage" className="text-xs text-slate-400 font-bold uppercase tracking-wider">Rows:</label>
             <select 
               id="rowsPerPage"
               className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-2 py-1 text-xs outline-none cursor-pointer"
               value={itemsPerPage}
               onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
             >
               {ITEMS_PER_PAGE_OPTIONS.map(opt => (
                 <option key={opt} value={opt}>{opt}</option>
               ))}
             </select>
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto p-5 min-h-[400px]">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] dark:bg-gray-700 text-[#1f2937] dark:text-gray-100 font-bold border border-slate-300 dark:border-gray-600">
                <th scope="col" className="px-4 py-3 text-left border border-slate-300 dark:border-gray-600 uppercase text-[11px]">Guest Details</th>
                <th scope="col" className="px-4 py-3 text-left border border-slate-300 dark:border-gray-600 uppercase text-[11px]">Contact Info</th>
                <th scope="col" className="px-4 py-3 text-left border border-slate-300 dark:border-gray-600 uppercase text-[11px]">Identity & Status</th>
                <th scope="col" className="px-4 py-3 text-right border border-slate-300 dark:border-gray-600 uppercase text-[11px] w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan="4" className="py-20 text-center"><SkeletonLoader /></td></tr>
              ) : guestList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-24 text-center border-x border-slate-200 dark:border-gray-700">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FaUserFriends size={48} className="mb-4 opacity-50" />
                      <p className="text-lg font-medium">No guests found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                guestList.map((guest) => (
                  <tr key={guest._id} className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 border-x border-slate-200 dark:border-gray-700 align-top">
                      <div className="flex flex-col">
                        <span className="font-semibold text-base text-[#66cc00]">
                          {guest.guestNamePrefix} {guest.guestName}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {guest.guestType} • {guest.nationality || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-x border-slate-200 dark:border-gray-700 align-top">
                      <div className="flex flex-col gap-1.5 text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-2 text-sm">
                          <FaPhone className="text-slate-400 text-xs" /> {guest.phoneCode} {guest.phoneNumber}
                        </span>
                        {guest.email && (
                          <span className="flex items-center gap-2 text-sm">
                            <FaEnvelope className="text-slate-400 text-xs" /> {guest.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-x border-slate-200 dark:border-gray-700 align-top">
                      <div className="flex flex-col gap-1.5">
                        <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <FaIdCard className="text-slate-400 text-xs" /> {guest.idNumber || 'No ID Provided'}
                        </span>
                        {guest.isVip && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded w-max">
                            <FaStar size={10} /> VIP Guest
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-x border-slate-200 dark:border-gray-700 text-right align-top">
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <button 
                          onClick={() => handleOpenModal(guest)} 
                          className="p-1.5 text-slate-500 hover:text-[#66cc00] hover:bg-slate-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Edit"
                        >
                          <FaEdit size={14}/>
                        </button>
                        <button 
                          onClick={() => handleDelete(guest._id)} 
                          className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Delete"
                        >
                          <FaTrash size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="px-6 py-4 bg-slate-50 dark:bg-gray-800 border-t border-slate-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-600 dark:text-gray-300">
            <div className="text-xs font-bold uppercase">
              Showing <span className="text-[#66cc00]">{guestList.length}</span> of {totalItems} Results
            </div>
            <div className="flex items-center gap-1 join" aria-label="Pagination">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-2 rounded-l border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-slate-100 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronLeft size={10} />
              </button>

              {paginationRange.map((pageNum, index) => (
                pageNum === '...' ? (
                  <span key={`dots-${index}`} className="px-2 text-slate-400 font-bold">...</span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1.5 border border-slate-300 dark:border-gray-600 text-xs font-bold transition-colors ${
                      currentPage === pageNum
                        ? "bg-[#66cc00] text-white border-[#66cc00]"
                        : "bg-white dark:bg-gray-700 hover:bg-slate-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              ))}

              <button 
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-2 rounded-r border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-slate-100 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronRight size={10} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer Modal (Extra Wide for complex layout) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity" role="dialog" aria-modal="true">
          <div className="w-full max-w-4xl bg-white dark:bg-gray-800 h-full shadow-2xl animate-slide-in-right p-6 md:p-8 overflow-y-auto flex flex-col relative">
            
            <div className="flex justify-between items-center mb-6 pb-4 shrink-0">
              <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <FaUserFriends className="text-[#66cc00]" /> {editingId ? "Edit Guest" : "Create Guest Profile"}
              </h3>
              <button 
                onClick={handleCloseModal} 
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              <div className="flex-1 space-y-8 pb-10">
                
                {/* Header Row: Image & Name */}
                <div className="flex flex-col md:flex-row gap-6 items-end">
                  
                  {/* Image Block */}
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 flex items-center justify-center relative rounded">
                      <span className="text-gray-400 text-sm text-center px-4 leading-tight">No Image<br/>available</span>
                    </div>
                    <button type="button" className="text-blue-600 dark:text-blue-400 text-sm flex items-center gap-1 mt-2 hover:underline">
                      <FaEdit size={12} /> Edit
                    </button>
                  </div>

                  {/* Name Block */}
                  <div className="flex-1 w-full mb-2 md:mb-0">
                    <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">Guest Name <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <select 
                        name="guestNamePrefix"
                        value={formData.guestNamePrefix}
                        onChange={handleInputChange}
                        className="w-24 border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00]"
                      >
                        <option value="Mr.">Mr.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Dr.">Dr.</option>
                      </select>
                      <input 
                        type="text"
                        name="guestName"
                        className={`flex-1 border ${errors.guestName ? 'border-red-500' : 'border-slate-300 dark:border-gray-600'} bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] w-full`}
                        value={formData.guestName}
                        onChange={handleInputChange}
                      />
                    </div>
                    {errors.guestName && <p className="text-red-500 text-xs mt-1"><FaExclamationCircle className="inline" /> {errors.guestName}</p>}
                  </div>

                </div>

                <hr className="border-slate-200 dark:border-gray-700" />

                {/* 4 Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
                  
                  {/* Column 1: Communication */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[#5c6bc0] dark:text-indigo-400 border-b border-slate-200 dark:border-gray-700 pb-2 mb-4 uppercase tracking-wider">Communication</h4>
                    
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">Phone Number <span className="text-red-500">*</span></label>
                      <div className="flex gap-2">
                        <select 
                          name="phoneCode"
                          value={formData.phoneCode}
                          onChange={handleInputChange}
                          className="w-20 border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-1 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00]"
                        >
                          {CountrAndCode.map((item, index) => (
                            <option key={`code-${index}`} value={item['Phone Code']}>
                              {item['Phone Code']}
                            </option>
                          ))}
                        </select>
                        <input 
                          type="tel"
                          name="phoneNumber"
                          className={`flex-1 border ${errors.phoneNumber ? 'border-red-500' : 'border-slate-300 dark:border-gray-600'} bg-white dark:bg-gray-700 rounded px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] w-full min-w-0`}
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                        />
                      </div>
                      {errors.phoneNumber && <p className="text-red-500 text-xs mt-1"><FaExclamationCircle className="inline" /> {errors.phoneNumber}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">Email</label>
                      <input 
                        type="email"
                        name="email"
                        className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00]"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Column 2: Address */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[#5c6bc0] dark:text-indigo-400 border-b border-slate-200 dark:border-gray-700 pb-2 mb-4 uppercase tracking-wider">Address</h4>
                    
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">Address</label>
                      <input type="text" name="address1" placeholder="Address 1" value={formData.address1} onChange={handleInputChange} className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] mb-2" />
                      <input type="text" name="address2" placeholder="Address 2" value={formData.address2} onChange={handleInputChange} className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00]" />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">City</label>
                      <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00]" />
                    </div>

                    {formData.country === "Bangladesh" && (
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">District</label>
                        <select name="district" value={formData.district} onChange={handleInputChange} className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00]">
                          <option value="">Select District</option>
                          {Disctric.map((item, index) => (
                            <option key={`dist-${index}`} value={item.district}>
                              {item.district}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">State</label>
                      <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00]" />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">Post Code</label>
                      <input type="text" name="postCode" value={formData.postCode} onChange={handleInputChange} className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00]" />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">Country</label>
                      <select name="country" value={formData.country} onChange={handleInputChange} className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00]">
                         <option value="">Select Country</option>
                         {CountrAndCode.map((item, index) => (
                          <option key={`country-${index}`} value={item.Name}>
                            {item.Name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Column 3: Personal Info */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[#5c6bc0] dark:text-indigo-400 border-b border-slate-200 dark:border-gray-700 pb-2 mb-4 uppercase tracking-wider">Personal Info</h4>
                    
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">Guest Type</label>
                      <select name="guestType" value={formData.guestType} onChange={handleInputChange} className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00]">
                        <option value="Adult">Adult</option>
                        <option value="Child">Child</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">Date of Birth</label>
                      <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00]" />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00]">
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">Nationality</label>
                      <select name="nationality" value={formData.nationality} onChange={handleInputChange} className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00]">
                        <option value="">Select</option>
                        {CountrAndCode.map((item, index) => (
                          <option key={`nat-${index}`} value={item.Name}>
                            {item.Name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Column 4: Additional Info */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[#5c6bc0] dark:text-indigo-400 border-b border-slate-200 dark:border-gray-700 pb-2 mb-4 uppercase tracking-wider">Additional Info</h4>
                    
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">Identity Type</label>
                      <select name="identityType" value={formData.identityType} onChange={handleInputChange} className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00]">
                        <option value="">Select</option>
                        {identityType.map((item, index) => (
                          <option key={`id-${index}`} value={item.name}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <input 
                        type="text" 
                        name="idNumber" 
                        placeholder="ID Number" 
                        value={formData.idNumber} 
                        onChange={handleInputChange} 
                        className="w-full border border-[#64b5f6] bg-[#f8fbff] dark:bg-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1976d2]" 
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider">Organisation</label>
                      <input type="text" name="organisation" value={formData.organisation} onChange={handleInputChange} className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00]" />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input type="checkbox" name="isVip" id="isVip" checked={formData.isVip} onChange={handleInputChange} className="w-3.5 h-3.5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <label htmlFor="isVip" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">VIP</label>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-wider pt-2">Preference / Notes</label>
                      <textarea name="preferenceNotes" rows="3" value={formData.preferenceNotes} onChange={handleInputChange} className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] resize-none"></textarea>
                    </div>
                  </div>

                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-end gap-3 mt-auto sticky bottom-0">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-slate-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded font-medium text-sm hover:bg-slate-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#66cc00] hover:bg-[#336600] text-white px-8 py-2 rounded font-medium text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center"
                >
                  {isSubmitting ? "Processing..." : editingId ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestManager;