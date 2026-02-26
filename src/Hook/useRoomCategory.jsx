import { useState, useCallback } from 'react';
import UseAxiosSecure from '../Hook/UseAxioSecure'; // Adjust path based on your folder structure

export const useRoomCategory = () => {
  const axiosSecure = UseAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- GET ALL ROOM CATEGORIES (With Pagination & Search) ---
  const getAllRoomCategories = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.get('/roomcategory', { params });
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  // --- GET ROOM CATEGORY BY ID ---
  const getRoomCategoryById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.get(`/roomcategory/get-id/${id}`);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  // --- CREATE ROOM CATEGORY ---
  const createRoomCategory = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.post('/roomcategory/post', payload);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err; 
    } finally {
      setLoading(false);
    }
  };

  // --- UPDATE ROOM CATEGORY ---
  const updateRoomCategory = async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.put(`/roomcategory/update/${id}`, payload);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE ROOM CATEGORY ---
  const removeRoomCategory = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.delete(`/roomcategory/delete/${id}`);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err; 
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getAllRoomCategories,
    getRoomCategoryById,
    createRoomCategory,
    updateRoomCategory,
    removeRoomCategory,
  };
};