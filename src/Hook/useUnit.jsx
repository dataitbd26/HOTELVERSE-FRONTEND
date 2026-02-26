import { useState, useCallback } from 'react';
import UseAxiosSecure from '../Hook/UseAxioSecure'; // Make sure this file name is exactly correct in your folder

export const useUnit = () => {
  const axiosSecure = UseAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- GET ALL UNITS ---
  const getAllUnits = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      console.log("📡 GET Request going out to /unit with params:", params);
      const { data } = await axiosSecure.get('/unit', { params });
      console.log("✅ GET Request successful. Received:", data);
      return data;
    } catch (err) {
      console.error("❌ GET Request failed:", err.response || err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  // --- CREATE UNIT ---
  const createUnit = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      console.log("📡 POST Request going out to /unit/post with payload:", payload);
      const { data } = await axiosSecure.post('/unit/post', payload);
      console.log("✅ POST Request successful. Received:", data);
      return data;
    } catch (err) {
      console.error("❌ POST Request failed:", err.response || err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err; 
    } finally {
      setLoading(false);
    }
  };

  // --- UPDATE UNIT ---
  const updateUnit = async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.put(`/unit/update/${id}`, payload);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE UNIT ---
  const removeUnit = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.delete(`/unit/delete/${id}`);
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
    getAllUnits,
    createUnit,
    updateUnit,
    removeUnit,
  };
};