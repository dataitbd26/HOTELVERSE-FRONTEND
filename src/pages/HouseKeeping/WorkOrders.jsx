import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet";
import { useWorkOrder } from "../../Hook/useWorkOrder"; 
import { useRoom } from "../../Hook/useRoom"; 
import { useWorkOrderCategory } from "../../Hook/useWorkOrderCategory"; 
import { useHouseKeepingStatus } from "../../Hook/useHouseKeepingStatus"; 
import { useHouseKeeper } from "../../Hook/useHousekeeper"; 
import SkeletonLoader from "../../components/SkeletonLoader";
import useAuth from "../../Hook/useAuth";
import { getPaginationRange } from "../../utilities/paginationUtils";
import PageHeader from "../../components/PageHeader";

import { 
  FaEdit, FaTrash, FaPlus, FaTimes, 
  FaChevronLeft, FaChevronRight, FaExclamationCircle, 
  FaWrench, FaCalendarAlt
} from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 15, 20, 50];

const defaultFormState = {
  detail: {
    order: "",
    roomUnit: "", 
    blockFrom: "",
    blockTo: "",
    deadline: "",
    houseStatus: ""
  },
  workInformation: {
    workCategory: "",
    complain: "",
    description: ""
  },
  workStatusInfo: {
    assignTo: "",
    priority: "Medium",
    status: "New",
    workDone: ""
  }
};

const WorkOrderManager = () => {
  const { user } = useAuth();
  const userBranch = user?.branch || "";

  const { 
    getAllWorkOrders, 
    createWorkOrder, 
    updateWorkOrder, 
    removeWorkOrder, 
    loading 
  } = useWorkOrder();

  // --- External Hooks for Dropdowns ---
  const { getAllRooms } = useRoom();
  const { getAllWorkOrderCategories } = useWorkOrderCategory();
  const { getAllHouseKeepingStatuses } = useHouseKeepingStatus();
  const { getAllHouseKeepers } = useHouseKeeper();

  // --- State Management ---
  const [workOrdersList, setWorkOrdersList] = useState([]);
  
  // Dropdown States for Modal
  const [availableRooms, setAvailableRooms] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [availableKeepers, setAvailableKeepers] = useState([]);
  
  // Search Filters (Replaced 'order' with 'roomUnit')
  const [searchFilters, setSearchFilters] = useState({
    roomUnit: "",
    category: "",
    status: "",
    assignTo: ""
  });
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Pagination
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
      if (activeSearchQuery !== "") {
        setCurrentPage(1); 
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [activeSearchQuery]);

  // --- Data Fetching ---
  const loadWorkOrders = useCallback(async () => {
    if (!userBranch) return; 

    try {
      const data = await getAllWorkOrders({ 
        page: currentPage, 
        limit: itemsPerPage, 
        search: activeSearchQuery,
        branch: userBranch 
      });
      
      if (data) {
        setWorkOrdersList(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.totalDocuments || 0);
      }
    } catch (error) {
      toast.error("Failed to load work orders");
    }
  }, [getAllWorkOrders, currentPage, itemsPerPage, activeSearchQuery, userBranch]);

  // Fetch Dropdown Data
  const loadDropdownData = useCallback(async () => {
    if (!userBranch) return;
    try {
      const [roomsRes, categoriesRes, statusesRes, keepersRes] = await Promise.all([
        getAllRooms({ page: 1, limit: 1000, branch: userBranch }),
        getAllWorkOrderCategories({ page: 1, limit: 1000, branch: userBranch }),
        getAllHouseKeepingStatuses({ page: 1, limit: 1000, branch: userBranch }),
        getAllHouseKeepers({ page: 1, limit: 1000, branch: userBranch })
      ]);
      
      if (roomsRes?.data) setAvailableRooms(roomsRes.data);
      if (categoriesRes?.data) setAvailableCategories(categoriesRes.data);
      
      // Handle array vs paginated object response for statuses
      if (Array.isArray(statusesRes)) {
        setAvailableStatuses(statusesRes);
      } else if (statusesRes?.data) {
        setAvailableStatuses(statusesRes.data);
      }

      if (keepersRes?.data) setAvailableKeepers(keepersRes.data);
      
    } catch (error) {
      console.error("Failed to fetch dropdown data", error);
    }
  }, [getAllRooms, getAllWorkOrderCategories, getAllHouseKeepingStatuses, getAllHouseKeepers, userBranch]);

  useEffect(() => { 
    loadWorkOrders(); 
    loadDropdownData();
  }, [loadWorkOrders, loadDropdownData]);

  // --- Filter Extraction (Unique Values for Top Dropdowns) ---
  const uniqueRooms = useMemo(() => {
    const rooms = workOrdersList.map(item => item.detail?.roomUnit).filter(Boolean);
    return [...new Set(rooms)];
  }, [workOrdersList]);

  const uniqueCategories = useMemo(() => {
    const cats = workOrdersList.map(item => item.workInformation?.workCategory).filter(Boolean);
    return [...new Set(cats)];
  }, [workOrdersList]);

  const uniqueAssignees = useMemo(() => {
    const assignees = workOrdersList.map(item => item.workStatusInfo?.assignTo).filter(Boolean);
    return [...new Set(assignees)];
  }, [workOrdersList]);

  // --- Handlers ---
  const handleSearchFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters(prev => ({ ...prev, [name]: value }));
  };

  const executeSearch = () => {
    const combinedSearch = [searchFilters.roomUnit, searchFilters.category, searchFilters.status, searchFilters.assignTo]
      .filter(Boolean)
      .join(" ");
      
    setActiveSearchQuery(combinedSearch);
    setCurrentPage(1);
    setHasSearched(true);
  };

  // Automatically execute search when a filter dropdown changes
  useEffect(() => {
     if(hasSearched || searchFilters.roomUnit || searchFilters.category || searchFilters.assignTo || searchFilters.status) {
         executeSearch();
     }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFilters.roomUnit, searchFilters.category, searchFilters.assignTo, searchFilters.status]);


  const handleOpenModal = useCallback((order = null) => {
    setErrors({}); 
    if (order) {
      setEditingId(order._id);
      setFormData({
        detail: {
          order: order.detail?.order || "",
          roomUnit: order.detail?.roomUnit || "", 
          blockFrom: order.detail?.blockFrom ? new Date(order.detail.blockFrom).toISOString().split('T')[0] : "",
          blockTo: order.detail?.blockTo ? new Date(order.detail.blockTo).toISOString().split('T')[0] : "",
          deadline: order.detail?.deadline ? new Date(order.detail.deadline).toISOString().split('T')[0] : "",
          houseStatus: order.detail?.houseStatus || ""
        },
        workInformation: {
          workCategory: order.workInformation?.workCategory || "",
          complain: order.workInformation?.complain || "",
          description: order.workInformation?.description || ""
        },
        workStatusInfo: {
          assignTo: order.workStatusInfo?.assignTo || "",
          priority: order.workStatusInfo?.priority || "Medium",
          status: order.workStatusInfo?.status || "New",
          workDone: order.workStatusInfo?.workDone || ""
        }
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

  const handleInputChange = (section, e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [section]: {
          ...prev[section],
          [name]: value
      }
    }));

    if (errors[`${section}.${name}`]) {
      setErrors(prev => ({ ...prev, [`${section}.${name}`]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.detail.order.trim()) newErrors['detail.order'] = "Order # is required.";
    if (!formData.detail.roomUnit.trim()) newErrors['detail.roomUnit'] = "Room/Unit is required."; 
    if (!formData.detail.deadline) newErrors['detail.deadline'] = "Deadline is required.";
    if (!formData.detail.houseStatus.trim()) newErrors['detail.houseStatus'] = "House Status is required.";
    
    if (!formData.workInformation.workCategory.trim()) newErrors['workInformation.workCategory'] = "Category is required.";
    if (!formData.workInformation.complain.trim()) newErrors['workInformation.complain'] = "Complaint is required.";

    if (!formData.workStatusInfo.assignTo.trim()) newErrors['workStatusInfo.assignTo'] = "Assign To is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userBranch) return toast.error("User branch not found. Please log in again.");
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = { 
        ...formData,
        branch: userBranch 
      };
      
      if (editingId) {
        await updateWorkOrder(editingId, payload);
        toast.success("Work Order updated successfully");
      } else {
        await createWorkOrder(payload);
        toast.success("Work Order created successfully");
      }
      
      handleCloseModal();
      loadWorkOrders();
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
      text: "This action cannot be undone. It will remove the work order record.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444", 
      cancelButtonColor: "#3d4451", 
      confirmButtonText: "Yes, delete",
      background: isDarkMode ? '#1f2937' : '#ffffff',
      color: isDarkMode ? '#f3f4f6' : '#374151',
    });

    if (result.isConfirmed) {
      try {
        await removeWorkOrder(id);
        toast.success("Deleted successfully");
        if (workOrdersList.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          loadWorkOrders();
        }
      } catch (err) { 
        toast.error(err.response?.data?.error || err.response?.data?.message || "Delete failed"); 
      }
    }
  }, [removeWorkOrder, loadWorkOrders, workOrdersList.length, currentPage]);

  const paginationRange = useMemo(() => 
    getPaginationRange(currentPage, totalPages), 
  [currentPage, totalPages]);

  return (
    <div className="bg-[#f1f5f9] dark:bg-gray-900 min-h-screen p-4 md:p-6 text-[#1f2937] dark:text-gray-100 transition-colors duration-300 relative overflow-hidden font-sans">
      
      <Helmet>
        <title>Work Orders | Admin Dashboard</title>
        <meta name="description" content="Manage hotel work orders and maintenance tasks." />
      </Helmet>

      {/* --- Page Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <PageHeader 
          title="Work Orders" 
          subtitle="Manage maintenance and housekeeping tasks" 
          icon={<FaWrench className="text-[#66cc00]" />} 
        />
        <button 
          onClick={() => handleOpenModal()}
          className="mt-4 md:mt-0 bg-[#66cc00] hover:bg-[#336600] text-white font-medium py-2 px-6 rounded shadow-sm transition flex items-center gap-2 focus:ring-2 focus:ring-offset-2 focus:ring-[#66cc00]"
        >
          <FaPlus size={12} /> Create Order
        </button>
      </div>

      {/* --- Search Filter Section --- */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-sm border border-slate-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col xl:flex-row gap-6 items-end">
          
          {/* Input Group (Dropdowns) */}
          <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
            
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Room #</label>
              <select 
                name="roomUnit"
                value={searchFilters.roomUnit}
                onChange={handleSearchFilterChange}
                className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] transition-all"
              >
                 <option value="">All Rooms</option>
                 {uniqueRooms.map((room, idx) => (
                    <option key={`filter-room-${idx}`} value={room}>{room}</option>
                 ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Category</label>
              <select 
                name="category"
                value={searchFilters.category}
                onChange={handleSearchFilterChange}
                className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] transition-all"
              >
                 <option value="">All Categories</option>
                 {uniqueCategories.map((cat, idx) => (
                    <option key={`filter-cat-${idx}`} value={cat}>{cat}</option>
                 ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Assign To</label>
              <select 
                name="assignTo"
                value={searchFilters.assignTo}
                onChange={handleSearchFilterChange}
                className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] transition-all"
              >
                 <option value="">All Staff</option>
                 {uniqueAssignees.map((assignee, idx) => (
                    <option key={`filter-assign-${idx}`} value={assignee}>{assignee}</option>
                 ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Status</label>
              <select 
                name="status"
                value={searchFilters.status}
                onChange={handleSearchFilterChange}
                className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] transition-all"
              >
                 <option value="">All Statuses</option>
                 <option value="New">New</option>
                 <option value="In Progress">In Progress</option>
                 <option value="Completed">Completed</option>
              </select>
            </div>

          </div>

          {/* Actions Group (Reset Search) */}
          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
            <button 
              onClick={() => {
                setSearchFilters({ roomUnit: "", category: "", status: "", assignTo: "" });
                setActiveSearchQuery("");
                setCurrentPage(1);
              }}
              className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium py-1.5 px-6 rounded shadow-sm transition text-sm whitespace-nowrap"
            >
              Reset Filters
            </button>
          </div>

        </div>
      </div>

      {/* --- Results Area --- */}
      <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
        
        {/* Table Header Controls (Rows Per Page) */}
        <div className="p-4 border-b border-slate-100 dark:border-gray-700 flex justify-end bg-slate-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2">
             <label htmlFor="rowsPerPage" className="text-xs text-slate-500 font-bold uppercase tracking-wider">Rows:</label>
             <select 
               id="rowsPerPage"
               className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-2 py-1 text-xs outline-none cursor-pointer focus:ring-1 focus:ring-[#66cc00]"
               value={itemsPerPage}
               onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
             >
               {ITEMS_PER_PAGE_OPTIONS.map(opt => (
                 <option key={opt} value={opt}>{opt}</option>
               ))}
             </select>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] dark:bg-gray-700 text-[#1f2937] dark:text-gray-100 font-bold border-b border-slate-300 dark:border-gray-600">
                <th scope="col" className="px-6 py-3 text-left uppercase text-[11px]">Order Details</th>
                <th scope="col" className="px-6 py-3 text-left uppercase text-[11px]">Work Info</th>
                <th scope="col" className="px-6 py-3 text-left uppercase text-[11px]">Status & Assignment</th>
                <th scope="col" className="px-6 py-3 text-right uppercase text-[11px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan="4" className="py-20 text-center"><SkeletonLoader /></td></tr>
              ) : workOrdersList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FaWrench size={40} className="mb-3 opacity-30" />
                      <p className="text-base font-medium">No work orders found matching criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                workOrdersList.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-col">
                        <span className="font-bold text-base text-[#66cc00]">
                          Order #{order.detail?.order}
                        </span>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                          Room: {order.detail?.roomUnit}
                        </span>
                        <span className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <FaCalendarAlt className="inline" /> Deadline: {new Date(order.detail?.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-col gap-1.5 text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-2 text-sm font-bold text-[#5c6bc0] dark:text-indigo-400">
                          {order.workInformation?.workCategory}
                        </span>
                        <span className="text-xs text-slate-500 truncate max-w-[200px]" title={order.workInformation?.complain}>
                           {order.workInformation?.complain}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-col gap-1.5">
                         <span className="text-sm text-slate-600 dark:text-slate-300">
                           Assignee: <span className="font-bold">{order.workStatusInfo?.assignTo}</span>
                         </span>
                         <div className="flex gap-2 mt-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border w-max ${
                              order.workStatusInfo?.priority === 'High' ? 'bg-red-50 text-red-600 border-red-200' :
                              order.workStatusInfo?.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                              'bg-green-50 text-[#66cc00] border-[#66cc00]/30'
                            }`}>
                              {order.workStatusInfo?.priority}
                            </span>
                            <span className="text-[10px] font-bold bg-slate-100 dark:bg-gray-600 text-slate-600 dark:text-gray-200 border border-slate-300 dark:border-gray-500 px-2 py-0.5 rounded w-max">
                              {order.workStatusInfo?.status}
                            </span>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right align-top">
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <button 
                          onClick={() => handleOpenModal(order)} 
                          className="p-1.5 text-slate-500 hover:text-[#66cc00] hover:bg-slate-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Edit"
                        >
                          <FaEdit size={14}/>
                        </button>
                        <button 
                          onClick={() => handleDelete(order._id)} 
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
          <div className="px-6 py-4 bg-slate-50 dark:bg-gray-800 border-t border-slate-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-600 dark:text-slate-300">
            <div className="text-xs font-bold uppercase">
              Showing <span className="text-[#66cc00]">{workOrdersList.length}</span> of {totalItems} Results
            </div>
            <div className="flex items-center gap-1">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-2.5 py-1.5 rounded border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-slate-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                    className={`px-3 py-1 border text-sm font-bold transition-colors rounded ${
                      currentPage === pageNum
                        ? "bg-[#66cc00] text-white border-[#66cc00] shadow-sm"
                        : "bg-white dark:bg-gray-700 text-slate-600 dark:text-gray-300 border-slate-300 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-600"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              ))}

              <button 
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1.5 rounded border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-slate-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronRight size={10} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- Drawer Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center md:justify-end bg-black/50 backdrop-blur-sm transition-opacity" role="dialog" aria-modal="true">
          <div className="w-full max-w-5xl bg-white dark:bg-gray-800 h-full md:h-screen md:rounded-l-xl shadow-2xl animate-slide-in-right p-6 md:p-8 overflow-y-auto flex flex-col relative">
            
            <div className="flex justify-between items-center mb-6 pb-4 shrink-0 border-b border-slate-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-[#1f2937] dark:text-gray-100 flex items-center gap-2">
                 {editingId ? "Edit Work Order" : "Create Work Order"}
              </h3>
              <button 
                onClick={handleCloseModal} 
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
              >
                <FaTimes size={24} />
              </button>
            </div>

            {/* Information Badge */}
            <div className="mb-6">
                <span className="bg-[#5c6bc0] text-white px-4 py-1.5 rounded text-sm font-bold inline-block shadow-sm tracking-wider uppercase">
                    Information
                </span>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              <div className="flex-1 pb-10">
                
                {/* 3 Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  
                  {/* Column 1: Detail */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-[#3d4451] dark:text-gray-200 border-b border-slate-200 dark:border-gray-700 pb-2 mb-4 text-center md:text-left">Detail</h4>
                    
                    {/* Order # */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <label className="text-[10px] font-bold uppercase text-[#3d4451] dark:text-gray-300 tracking-wider sm:w-24 sm:text-right shrink-0">Order # <span className="text-red-500">*</span></label>
                      <div className="flex-1">
                        <input 
                          type="text"
                          name="order"
                          className={`w-full border ${errors['detail.order'] ? 'border-red-500' : 'border-slate-300 dark:border-gray-600'} rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] bg-slate-50 dark:bg-gray-700 text-[#1f2937] dark:text-gray-100`}
                          value={formData.detail.order}
                          onChange={(e) => handleInputChange('detail', e)}
                        />
                        {errors['detail.order'] && <p className="text-red-500 text-[10px] mt-1">{errors['detail.order']}</p>}
                      </div>
                    </div>

                    {/* Room/Unit - Dynamic (Room Name Only) */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <label className="text-[10px] font-bold uppercase text-[#3d4451] dark:text-gray-300 tracking-wider sm:w-24 sm:text-right shrink-0">Room/Unit <span className="text-red-500">*</span></label>
                      <div className="flex-1">
                        <select 
                          name="roomUnit"
                          className={`w-full border ${errors['detail.roomUnit'] ? 'border-red-500' : 'border-slate-300 dark:border-gray-600'} rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] bg-white dark:bg-gray-700 text-[#1f2937] dark:text-gray-100`}
                          value={formData.detail.roomUnit}
                          onChange={(e) => handleInputChange('detail', e)}
                        >
                          <option value="">Select Room</option>
                          {availableRooms.map((room) => (
                            <option key={room._id} value={room.roomName}>
                              {room.roomName}
                            </option>
                          ))}
                        </select>
                        {errors['detail.roomUnit'] && <p className="text-red-500 text-[10px] mt-1">{errors['detail.roomUnit']}</p>}
                      </div>
                    </div>

                    {/* Block From */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <label className="text-[10px] font-bold uppercase text-[#3d4451] dark:text-gray-300 tracking-wider sm:w-24 sm:text-right shrink-0">Block From</label>
                      <div className="flex-1">
                        <input 
                          type="date"
                          name="blockFrom"
                          className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] text-[#1f2937] dark:text-gray-100"
                          value={formData.detail.blockFrom}
                          onChange={(e) => handleInputChange('detail', e)}
                        />
                      </div>
                    </div>

                     {/* Block To */}
                     <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <label className="text-[10px] font-bold uppercase text-[#3d4451] dark:text-gray-300 tracking-wider sm:w-24 sm:text-right shrink-0">Block To</label>
                      <div className="flex-1">
                        <input 
                          type="date"
                          name="blockTo"
                          className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] text-[#1f2937] dark:text-gray-100"
                          value={formData.detail.blockTo}
                          onChange={(e) => handleInputChange('detail', e)}
                        />
                      </div>
                    </div>

                    {/* Deadline */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <label className="text-[10px] font-bold uppercase text-[#3d4451] dark:text-gray-300 tracking-wider sm:w-24 sm:text-right shrink-0">Deadline <span className="text-red-500">*</span></label>
                      <div className="flex-1 flex gap-2">
                        <input 
                          type="date"
                          name="deadline"
                          className={`flex-1 border ${errors['detail.deadline'] ? 'border-red-500' : 'border-slate-300 dark:border-gray-600'} rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] bg-white dark:bg-gray-700 text-[#1f2937] dark:text-gray-100 min-w-0`}
                          value={formData.detail.deadline}
                          onChange={(e) => handleInputChange('detail', e)}
                        />
                        <div className="flex items-center border border-slate-300 dark:border-gray-600 rounded px-2 w-16 bg-slate-50 dark:bg-gray-600">
                           <input type="text" defaultValue="1" className="w-full text-center outline-none text-sm bg-transparent text-[#1f2937] dark:text-gray-100"/>
                           <span className="text-slate-500 dark:text-gray-300">🕐</span>
                        </div>
                      </div>
                    </div>
                    {errors['detail.deadline'] && <p className="text-red-500 text-[10px] mt-1 ml-[112px]">{errors['detail.deadline']}</p>}

                    {/* House Status - Dynamic */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <label className="text-[10px] font-bold uppercase text-[#3d4451] dark:text-gray-300 tracking-wider sm:w-24 sm:text-right shrink-0 leading-tight">House<br/>Status <span className="text-red-500">*</span></label>
                      <div className="flex-1">
                        <select 
                          name="houseStatus"
                          className={`w-full border ${errors['detail.houseStatus'] ? 'border-red-500' : 'border-slate-300 dark:border-gray-600'} rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] bg-white dark:bg-gray-700 text-[#1f2937] dark:text-gray-100`}
                          value={formData.detail.houseStatus}
                          onChange={(e) => handleInputChange('detail', e)}
                        >
                          <option value="">Select Status</option>
                          {availableStatuses.map((status) => (
                            <option key={status._id} value={status.name}>
                              {status.name}
                            </option>
                          ))}
                        </select>
                        {errors['detail.houseStatus'] && <p className="text-red-500 text-[10px] mt-1">{errors['detail.houseStatus']}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Work Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-[#3d4451] dark:text-gray-200 border-b border-slate-200 dark:border-gray-700 pb-2 mb-4 text-center md:text-left">Work Information</h4>
                    
                    {/* Category - Dynamic */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                      <label className="text-[10px] font-bold uppercase text-[#3d4451] dark:text-gray-300 tracking-wider sm:w-24 sm:text-right shrink-0 sm:pt-1.5">Category <span className="text-red-500">*</span></label>
                      <div className="flex-1">
                         <select 
                          name="workCategory"
                          className={`w-full border ${errors['workInformation.workCategory'] ? 'border-red-500' : 'border-slate-300 dark:border-gray-600'} rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] bg-white dark:bg-gray-700 text-[#1f2937] dark:text-gray-100`}
                          value={formData.workInformation.workCategory}
                          onChange={(e) => handleInputChange('workInformation', e)}
                        >
                          <option value="">Select Category</option>
                          {availableCategories.map((category) => (
                            <option key={category._id} value={category.categoryName || category.name}>
                              {category.categoryName || category.name}
                            </option>
                          ))}
                        </select>
                        {errors['workInformation.workCategory'] && <p className="text-red-500 text-[10px] mt-1">{errors['workInformation.workCategory']}</p>}
                      </div>
                    </div>

                    {/* Complaint */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                      <label className="text-[10px] font-bold uppercase text-[#3d4451] dark:text-gray-300 tracking-wider sm:w-24 sm:text-right shrink-0 sm:pt-1.5">Complaint <span className="text-red-500">*</span></label>
                      <div className="flex-1">
                        <textarea 
                          name="complain"
                          rows="2"
                          className={`w-full border ${errors['workInformation.complain'] ? 'border-red-500' : 'border-slate-300 dark:border-gray-600'} rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] bg-slate-50 dark:bg-gray-700 text-[#1f2937] dark:text-gray-100 resize-none`}
                          value={formData.workInformation.complain}
                          onChange={(e) => handleInputChange('workInformation', e)}
                        ></textarea>
                        {errors['workInformation.complain'] && <p className="text-red-500 text-[10px] mt-1">{errors['workInformation.complain']}</p>}
                      </div>
                    </div>

                     {/* Description */}
                     <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                      <label className="text-[10px] font-bold uppercase text-[#3d4451] dark:text-gray-300 tracking-wider sm:w-24 sm:text-right shrink-0 sm:pt-1.5">Description</label>
                      <div className="flex-1">
                        <textarea 
                          name="description"
                          rows="3"
                          className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] text-[#1f2937] dark:text-gray-100 resize-none"
                          value={formData.workInformation.description}
                          onChange={(e) => handleInputChange('workInformation', e)}
                        ></textarea>
                      </div>
                    </div>

                  </div>

                  {/* Column 3: Work Status */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-[#3d4451] dark:text-gray-200 border-b border-slate-200 dark:border-gray-700 pb-2 mb-4 text-center md:text-left">Work Status</h4>
                    
                    {/* Assign To - Dynamic */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <label className="text-[10px] font-bold uppercase text-[#3d4451] dark:text-gray-300 tracking-wider sm:w-24 sm:text-right shrink-0">Assign To <span className="text-red-500">*</span></label>
                      <div className="flex-1">
                        <select 
                          name="assignTo"
                          className={`w-full border ${errors['workStatusInfo.assignTo'] ? 'border-red-500' : 'border-slate-300 dark:border-gray-600'} rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] bg-white dark:bg-gray-700 text-[#1f2937] dark:text-gray-100`}
                          value={formData.workStatusInfo.assignTo}
                          onChange={(e) => handleInputChange('workStatusInfo', e)}
                        >
                          <option value="">Select Staff</option>
                          {availableKeepers.map((keeper) => (
                            <option key={keeper._id} value={keeper.name}>
                              {keeper.name}
                            </option>
                          ))}
                        </select>
                        {errors['workStatusInfo.assignTo'] && <p className="text-red-500 text-[10px] mt-1">{errors['workStatusInfo.assignTo']}</p>}
                      </div>
                    </div>

                    {/* Priority */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <label className="text-[10px] font-bold uppercase text-[#3d4451] dark:text-gray-300 tracking-wider sm:w-24 sm:text-right shrink-0">Priority</label>
                      <div className="flex-1">
                        <select 
                          name="priority"
                          className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] text-[#1f2937] dark:text-gray-100"
                          value={formData.workStatusInfo.priority}
                          onChange={(e) => handleInputChange('workStatusInfo', e)}
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <label className="text-[10px] font-bold uppercase text-[#3d4451] dark:text-gray-300 tracking-wider sm:w-24 sm:text-right shrink-0">Status</label>
                      <div className="flex-1">
                        <select 
                          name="status"
                          className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] text-[#1f2937] dark:text-gray-100"
                          value={formData.workStatusInfo.status}
                          onChange={(e) => handleInputChange('workStatusInfo', e)}
                        >
                          <option value="New">New</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>

                    {/* Work Done */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                      <label className="text-[10px] font-bold uppercase text-[#3d4451] dark:text-gray-300 tracking-wider sm:w-24 sm:text-right shrink-0 sm:pt-1.5">Work Done</label>
                      <div className="flex-1">
                        <textarea 
                          name="workDone"
                          rows="3"
                          className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#66cc00] text-[#1f2937] dark:text-gray-100 resize-none"
                          value={formData.workStatusInfo.workDone}
                          onChange={(e) => handleInputChange('workStatusInfo', e)}
                        ></textarea>
                      </div>
                    </div>

                  </div>

                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-end gap-3 mt-auto sticky bottom-0">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-slate-300 dark:border-gray-600 text-[#3d4451] dark:text-gray-300 rounded font-bold text-sm hover:bg-slate-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#66cc00] hover:bg-[#336600] text-white px-8 py-2 rounded font-bold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center"
                >
                  {isSubmitting ? "Processing..." : editingId ? "Update Order" : "Save Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrderManager;