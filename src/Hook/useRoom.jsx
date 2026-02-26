import { useState, useCallback } from 'react';
import UseAxiosSecure from "../Hook/UseAxioSecure"; // Adjust path if needed based on your folder structure

export const useRoom = () => {
  const axiosSecure = UseAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- GET ALL ROOMS (With Pagination & Search) ---
  const getAllRooms = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.get('/room', { params });
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  // --- GET ROOM BY ID ---
  const getRoomById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.get(`/room/get-id/${id}`);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  // --- CREATE ROOM ---
  const createRoom = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.post('/room/post', payload);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err; 
    } finally {
      setLoading(false);
    }
  };

  // --- UPDATE ROOM ---
  const updateRoom = async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.put(`/room/update/${id}`, payload);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE ROOM ---
  const removeRoom = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.delete(`/room/delete/${id}`);
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
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
    removeRoom,
  };
};