import React, { useState, useEffect, useCallback } from "react";
import { useHouseKeeper } from "../../../Hook/useHousekeeper"; // Adjusted path
import SkeletonLoader from "../../../components/SkeletonLoader";
import TableControls from "../../../components/TableControls";
import { 
  FaEdit, FaTrash, FaPlus, FaTimes, FaUserTie,
  FaChevronLeft, FaChevronRight, FaPhone, FaGlobe, FaMapMarkerAlt 
} from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const HouseKeepers = () => {
  const { 
    getSuperAdminHouseKeepers, // Using this as the primary fetcher based on your hook
    createHouseKeeper, 
    updateHouseKeeper, 
    removeHouseKeeper, 
    loading 
  } = useHouseKeeper();

  // State Management
  const [houseKeepers, setHouseKeepers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialForm = { name: "", phone: "", language: "", branch: "" };
  const [formData, setFormData] = useState(initialForm);

  // Load Data
  const loadHouseKeepers = useCallback(async () => {
    const data = await getSuperAdminHouseKeepers({ 
        page: currentPage, 
        limit: itemsPerPage, 
        search: searchTerm 
    });
    if (data) {
      setHouseKeepers(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
    }
  }, [getSuperAdminHouseKeepers, currentPage, itemsPerPage, searchTerm]);

  useEffect(() => { loadHouseKeepers(); }, [loadHouseKeepers]);

  // Modal Handlers
  const handleOpenModal = (keeper = null) => {
    if (keeper) {
      setEditingId(keeper._id);
      setFormData({ 
        name: keeper.name, 
        phone: keeper.phone, 
        language: keeper.language, 
        branch: keeper.branch 
      });
    } else {
      setEditingId(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateHouseKeeper(editingId, formData);
        toast.success("House Keeper updated");
      } else {
        await createHouseKeeper(formData);
        toast.success("House Keeper created");
      }
      setIsModalOpen(false);
      loadHouseKeepers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const isDark = document.documentElement.classList.contains("dark");

    Swal.fire({
      title: "Are you sure?",
      text: "This record will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      background: isDark ? "#1f2937" : "#fff",
      color: isDark ? "#fff" : "#000",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await removeHouseKeeper(id);
          toast.success("Deleted successfully");
          loadHouseKeepers();
        } catch (err) {
          toast.error("Deletion failed");
        }
      }
    });
  };

  return (
    <div className="p-6 bg-base-200 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm mb-6 border-l-8 border-primary transition-colors">
        <div>
          <h1 className="text-3xl font-black text-secondary dark:text-white flex items-center gap-2">
            <FaUserTie className="text-primary" /> House Keepers
          </h1>
          <p className="text-neutral-500 dark:text-gray-400 font-medium italic text-sm">Manage staff, languages, and assigned branches</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary text-white shadow-lg mt-4 md:mt-0">
          <FaPlus /> Add House Keeper
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-base-100 dark:bg-gray-800 rounded-2xl shadow-sm border border-base-300 dark:border-gray-700 transition-colors">
        <div className="p-4 bg-base-50/50 dark:bg-gray-700/30">
          <TableControls 
            itemsPerPage={itemsPerPage} 
            onItemsPerPageChange={(e) => { setItemsPerPage(e.target.value); setCurrentPage(1); }} 
            searchTerm={searchTerm} 
            onSearchChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
          />
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-base-200/50 dark:bg-gray-700/50 text-secondary dark:text-gray-200 uppercase text-[10px] tracking-widest border-b dark:border-gray-600">
              <tr>
                <th>Staff Name</th>
                <th>Contact & Language</th>
                <th>Branch</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && houseKeepers.length === 0 ? (
                <tr><td colSpan="4"><SkeletonLoader /></td></tr>
              ) : (
                houseKeepers.map((keeper) => (
                  <tr key={keeper._id} className="hover:bg-primary/5 dark:hover:bg-gray-700/50 transition-colors border-b dark:border-gray-700 border-base-200">
                    <td>
                        <div className="font-bold text-secondary dark:text-white text-lg">{keeper.name}</div>
                        <div className="text-xs opacity-50 flex items-center gap-1"><FaUserTie/> ID: {keeper._id.slice(-6).toUpperCase()}</div>
                    </td>
                    <td>
                        <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-2 text-sm"><FaPhone className="text-primary text-xs"/> {keeper.phone}</span>
                            <span className="flex items-center gap-2 text-xs opacity-70"><FaGlobe className="text-secondary text-xs"/> {keeper.language}</span>
                        </div>
                    </td>
                    <td>
                      <div className="badge badge-ghost dark:bg-gray-700 dark:text-gray-300 font-medium py-3">
                        <FaMapMarkerAlt className="mr-1 text-error"/> {keeper.branch}
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => handleOpenModal(keeper)} className="btn btn-sm btn-ghost text-primary hover:bg-primary/10"><FaEdit /></button>
                        <button onClick={() => handleDelete(keeper._id)} className="btn btn-sm btn-ghost text-error hover:bg-error/10"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 flex flex-col md:flex-row justify-between items-center bg-base-50 dark:bg-gray-800 rounded-b-2xl border-t dark:border-gray-700 transition-colors">
            <span className="text-xs font-medium opacity-60 dark:text-gray-400 mb-2 md:mb-0">Showing {houseKeepers.length} of {totalItems}</span>
            <div className="join">
               <button disabled={currentPage === 1} className="join-item btn btn-xs dark:bg-gray-700 dark:text-white dark:border-gray-600" onClick={() => setCurrentPage(p => p - 1)}><FaChevronLeft/></button>
               <button className="join-item btn btn-xs bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 px-4">{currentPage}</button>
               <button disabled={currentPage >= totalPages} className="join-item btn btn-xs dark:bg-gray-700 dark:text-white dark:border-gray-600" onClick={() => setCurrentPage(p => p + 1)}><FaChevronRight/></button>
            </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 dark:bg-gray-800 rounded-2xl w-full max-w-md border-t-8 border-primary shadow-2xl transition-colors">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-base-50 dark:bg-gray-700/50">
              <h2 className="text-xl font-bold text-secondary dark:text-white flex items-center gap-2">
                <FaUserTie/> {editingId ? "Edit House Keeper" : "New House Keeper"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-circle btn-ghost btn-sm dark:text-gray-300 dark:hover:bg-gray-600"><FaTimes/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="form-control">
                <label className="label-text font-semibold mb-1 dark:text-gray-300">Full Name <span className="text-error">*</span></label>
                <input 
                  required 
                  className="input input-bordered focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                    <label className="label-text font-semibold mb-1 dark:text-gray-300">Phone <span className="text-error">*</span></label>
                    <input 
                    required 
                    className="input input-bordered focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                    />
                </div>
                <div className="form-control">
                    <label className="label-text font-semibold mb-1 dark:text-gray-300">Language <span className="text-error">*</span></label>
                    <input 
                    required 
                    className="input input-bordered focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                    placeholder="e.g. English"
                    value={formData.language} 
                    onChange={e => setFormData({...formData, language: e.target.value})} 
                    />
                </div>
              </div>
              <div className="form-control">
                <label className="label-text font-semibold mb-1 dark:text-gray-300">Branch <span className="text-error">*</span></label>
                <input 
                  required
                  className="input input-bordered focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                  placeholder="e.g. Downtown Branch" 
                  value={formData.branch} 
                  onChange={e => setFormData({...formData, branch: e.target.value})} 
                />
              </div>

              <div className="flex justify-end gap-2 mt-6 border-t dark:border-gray-700 pt-4">
                <button type="button" className="btn btn-ghost dark:text-gray-300 dark:hover:bg-gray-700" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary text-white px-8" disabled={isSubmitting}>
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

export default HouseKeepers;