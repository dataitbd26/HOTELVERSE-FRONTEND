import React, { useState, useEffect, useCallback } from "react";
import { useHouseKeepingStatus } from "../../../Hook/useHouseKeepingStatus";
import SkeletonLoader from "../../../components/SkeletonLoader";
import useAuth from "../../../Hook/useAuth";
import { getPaginationRange } from "../../../utilities/paginationUtils";

import { 
  FaEdit, FaTrash, FaPlus, FaTimes, FaBuilding, 
  FaChevronDown, FaChevronLeft, FaChevronRight 
} from "react-icons/fa";
import { HiCheck, HiX } from "react-icons/hi";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const HouseKeepingStatusManager = () => {
  const { user } = useAuth();
  const branchName = user?.branch;

  const { 
    getSuperAdminHouseKeepingStatuses, 
    createHouseKeepingStatus, 
    updateHouseKeepingStatus, 
    removeHouseKeepingStatus, 
    loading 
  } = useHouseKeepingStatus();

  const [statuses, setStatuses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({ name: "", colorCode: "#66cc00", isDirty: false, branch: "" });

  const loadStatuses = useCallback(async () => {
    const data = await getSuperAdminHouseKeepingStatuses({ 
        page: currentPage, 
        limit: itemsPerPage, 
        search: searchTerm 
    });
    if (data) {
      setStatuses(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalItems(data.pagination?.totalDocuments || 0);
    }
  }, [getSuperAdminHouseKeepingStatuses, currentPage, itemsPerPage, searchTerm]);

  useEffect(() => { loadStatuses(); }, [loadStatuses]);

  const handleOpenModal = (status = null) => {
    setErrors({});
    if (status) {
      setEditingId(status._id);
      setFormData({ 
        name: status.name, 
        colorCode: status.colorCode, 
        isDirty: status.isDirty, 
        branch: status.branch || branchName 
      });
    } else {
      setEditingId(null);
      setFormData({ 
        name: "", 
        colorCode: "#66cc00", 
        isDirty: false, 
        branch: branchName 
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!branchName) {
      toast.error("User branch not found. Please log in again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { ...formData, branch: branchName };
      if (editingId) {
        await updateHouseKeepingStatus(editingId, payload);
        toast.success("Configuration updated");
      } else {
        await createHouseKeepingStatus(payload);
        toast.success("Status created");
      }
      setIsModalOpen(false);
      loadStatuses();
    } catch (err) {
      toast.error(err.response?.data?.error || "Execution failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Confirm Deletion",
      text: "This will remove the status from all branch records.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#66cc00",
      cancelButtonColor: "#3d4451",
      confirmButtonText: "Yes, delete",
      background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#374151',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await removeHouseKeepingStatus(id);
          toast.success("Deleted successfully");
          loadStatuses();
        } catch (err) { toast.error("Delete failed"); }
      }
    });
  };

  return (
    <div className="bg-[#f1f5f9] dark:bg-gray-900 min-h-screen p-4 md:p-6 text-[#1f2937] dark:text-gray-100 transition-colors duration-300 relative overflow-hidden">
      
      {/* Header Area */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">House Keeping Status</h2>
          <p className="text-xs text-slate-400 dark:text-gray-500 mt-1 uppercase tracking-widest font-bold">System Setup / Status Configuration</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#66cc00] hover:bg-[#336600] text-white px-6 py-2 rounded text-sm font-bold shadow-sm flex items-center gap-2 transition-colors"
        >
          <FaPlus size={12} /> Create
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded shadow-md border border-slate-200 dark:border-gray-700 overflow-hidden">
        
        {/* Search & Filter */}
        <div className="p-5 border-b border-slate-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-bold">Name</label>
            <input 
              type="text"
              className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-3 py-1.5 text-sm w-full md:w-72 focus:ring-1 focus:ring-[#66cc00] outline-none"
              placeholder="Filter by status name..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            <button 
              onClick={loadStatuses}
              className="bg-[#3d4451] dark:bg-gray-600 hover:bg-[#1f2937] text-white px-5 py-1.5 rounded text-sm font-bold transition-colors"
            >
              Search
            </button>
          </div>
          
          <div className="flex items-center gap-2">
             <span className="text-xs text-slate-400 font-bold uppercase">Rows:</span>
             <select 
               className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-2 py-1 text-xs outline-none"
               value={itemsPerPage}
               onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
             >
               <option value={5}>5</option>
               <option value={10}>10</option>
               <option value={15}>15</option>
               <option value={20}>20</option>
             </select>
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto p-5">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] dark:bg-gray-700 text-[#1f2937] dark:text-gray-100 font-bold border border-slate-300 dark:border-gray-600">
                <th className="px-4 py-3 text-left border border-slate-300 dark:border-gray-600 uppercase text-[11px]">Name</th>
                <th className="px-4 py-3 text-left border border-slate-300 dark:border-gray-600 uppercase text-[11px]">Color Code</th>
                <th className="px-4 py-3 text-center border border-slate-300 dark:border-gray-600 uppercase text-[11px]">Is Dirty Status</th>
                <th className="px-4 py-3 text-right border border-slate-300 dark:border-gray-600 uppercase text-[11px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan="4" className="py-20 text-center"><SkeletonLoader /></td></tr>
              ) : statuses.length === 0 ? (
                <tr><td colSpan="4" className="py-20 text-center text-slate-400 italic font-medium">No records found.</td></tr>
              ) : statuses.map((status) => (
                <tr key={status._id} className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-3 border-x border-slate-200 dark:border-gray-700 font-medium">{status.name}</td>
                  <td className="px-4 py-3 border-x border-slate-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-5 rounded border border-slate-400" style={{ backgroundColor: status.colorCode }} />
                      <span className="text-[10px] font-mono text-slate-400">{status.colorCode}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center border-x border-slate-200 dark:border-gray-700">
                    {status.isDirty ? (
                      <HiCheck className="inline-block text-[#66cc00] text-xl font-bold" />
                    ) : (
                      <HiX className="inline-block text-red-500 text-xl font-bold" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-right border-x border-slate-200 dark:border-gray-700">
                    <div className="dropdown dropdown-left">
                      <label tabIndex={0} className="bg-[#66cc00] hover:bg-[#336600] text-white px-4 py-1.5 rounded text-[11px] font-bold cursor-pointer flex items-center gap-2 ml-auto w-fit transition-all shadow-sm">
                        Action <FaChevronDown size={8} />
                      </label>
                      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-2xl bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 w-36 mr-2">
                        <li><button onClick={() => handleOpenModal(status)} className="hover:text-[#66cc00] dark:text-gray-200 flex items-center gap-2 font-semibold"><FaEdit size={12}/> Edit</button></li>
                        <li><button onClick={() => handleDelete(status._id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 font-semibold"><FaTrash size={12}/> Delete</button></li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- Updated Pagination --- */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-gray-800 border-t border-slate-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-600 dark:text-gray-300">
          <div className="text-xs font-bold uppercase">
            Showing <span className="text-[#66cc00]">{statuses.length}</span> of {totalItems} Results
          </div>
          <div className="flex items-center gap-1 join">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-2 rounded-l border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-slate-100 dark:hover:bg-gray-600 disabled:opacity-30"
            >
              <FaChevronLeft size={10} />
            </button>

            {/* UPDATED CALL: Passing currentPage and totalPages to the imported helper */}
            {getPaginationRange(currentPage, totalPages).map((pageNum, index) => (
              pageNum === '...' ? (
                <span key={`dots-${index}`} className="px-2 text-slate-400">...</span>
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
              className="px-3 py-2 rounded-r border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-slate-100 dark:hover:bg-gray-600 disabled:opacity-30"
            >
              <FaChevronRight size={10} />
            </button>
          </div>
        </div>
      </div>

      {/* --- DRAWER MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 h-full shadow-2xl animate-slide-in-right p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 dark:border-gray-700 pb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                {editingId ? "Edit Configuration" : "New Status Setup"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Status Name</label>
                <input 
                  required
                  type="text"
                  className="w-full border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-700 rounded px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#66cc00]/20 focus:border-[#66cc00] transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Cleaning in Progress"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Identify Color</label>
                <div className="flex gap-4 items-center bg-slate-50 dark:bg-gray-700 p-3 rounded border border-slate-200 dark:border-gray-600">
                  <input 
                    type="color"
                    className="w-12 h-12 rounded cursor-pointer border-none bg-transparent"
                    value={formData.colorCode}
                    onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                  />
                  <input 
                    type="text"
                    className="bg-transparent font-mono text-sm uppercase outline-none flex-1"
                    value={formData.colorCode}
                    onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-700 rounded-lg border border-slate-200 dark:border-gray-600">
                <div>
                  <label className="font-bold text-sm block">Dirty Status Mark</label>
                  <p className="text-[10px] text-slate-400">Toggle if this status implies a dirty room</p>
                </div>
                <input 
                  type="checkbox" 
                  className="toggle toggle-success"
                  checked={formData.isDirty}
                  onChange={(e) => setFormData({ ...formData, isDirty: e.target.checked })}
                />
              </div>

              <div className="pt-6 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-slate-200 dark:border-gray-600 rounded font-bold text-sm hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#66cc00] hover:bg-[#336600] text-white px-6 py-3 rounded font-bold text-sm shadow-lg disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? "Processing..." : editingId ? "Update Record" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HouseKeepingStatusManager;