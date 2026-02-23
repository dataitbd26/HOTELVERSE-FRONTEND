import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure'; // Using your secure axios instance

export const useHouseKeepingStatus = () => {
  const axiosSecure = UseAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- GET ALL (Basic list) ---
  const getAllHouseKeepingStatuses = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.get('/housekeeping-status'); 
      //branch
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  // --- GET SUPER ADMIN (With Pagination & Search) ---
  const getSuperAdminHouseKeepingStatuses = useCallback(async (params) => {
    setLoading(true);
    try {
      // params usually: { page, limit, search }
      const { data } = await axiosSecure.get('/housekeeping-status/superadmin/all', { params });
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  // --- GET BY ID ---
  const getHouseKeepingStatusById = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.get(`/housekeeping-status/get-id/${id}`);
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  // --- CREATE ---
  const createHouseKeepingStatus = async (statusData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.post('/housekeeping-status/post', statusData);
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      throw err; // Throwing allows the component to handle toast notifications
    } finally {
      setLoading(false);
    }
  };

  // --- UPDATE ---
  const updateHouseKeepingStatus = async (id, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.put(`/housekeeping-status/update/${id}`, updateData);
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE ---
  const removeHouseKeepingStatus = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.delete(`/housekeeping-status/delete/${id}`);
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getAllHouseKeepingStatuses,
    getSuperAdminHouseKeepingStatuses,
    getHouseKeepingStatusById,
    createHouseKeepingStatus,
    updateHouseKeepingStatus,
    removeHouseKeepingStatus,
  };
};