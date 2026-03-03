// useTableReservation.js
import { useState, useCallback } from "react";
import UseAxiosSecure from "./UseAxioSecure"; // Ensure this matches your file name exactly

export const useTableReservation = () => {
  const axiosSecure = UseAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAllReservations = useCallback(async (params) => {
    setLoading(true);
    try {
      const response = await axiosSecure.get("/api/tablereservation", { params });
      return response.data;
    } catch (err) {
      console.error("GET API Error:", err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  const getReservationById = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await axiosSecure.get(`/api/tablereservation/get-id/${id}`);
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  const createReservation = useCallback(async (data) => {
    setLoading(true);
    try {
      console.log("🚀 SENDING PAYLOAD TO BACKEND:", data);
      const response = await axiosSecure.post("/api/tablereservation/post", data);
      console.log("✅ BACKEND SUCCESS RESPONSE:", response.data);
      return response.data;
    } catch (err) {
      console.error("❌ BACKEND REJECTED SAVE. ERROR DETAILS:", err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  const updateReservation = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const response = await axiosSecure.put(`/api/tablereservation/update/${id}`, data);
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  const removeReservation = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await axiosSecure.delete(`/api/tablereservation/delete/${id}`);
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  return {
    getAllReservations,
    getReservationById,
    createReservation,
    updateReservation,
    removeReservation,
    loading,
    error
  };
};