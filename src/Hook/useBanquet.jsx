// useBanquet.js
import { useState, useCallback } from 'react';
import UseAxiosSecure from '../Hook/UseAxioSecure'; 

export const useBanquet = () => {
  const axiosSecure = UseAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- GET ALL BANQUETS (With Pagination & Search) ---
  const getAllBanquets = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.get('/banquet', { params });
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  // --- GET BANQUET BY ID ---
  const getBanquetById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.get(`/banquet/get-id/${id}`);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  // --- CREATE BANQUET ---
  const createBanquet = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.post('/banquet/post', payload);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err; 
    } finally {
      setLoading(false);
    }
  };

  // --- UPDATE BANQUET ---
  const updateBanquet = async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.put(`/banquet/update/${id}`, payload);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE BANQUET ---
  const removeBanquet = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.delete(`/banquet/delete/${id}`);
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
    getAllBanquets,
    getBanquetById,
    createBanquet,
    updateBanquet,
    removeBanquet,
  };
};