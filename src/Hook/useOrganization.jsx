import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure'; 

export const useOrganization = () => {
  const axiosSecure = UseAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- GET ALL ORGANIZATIONS ---
  const getAllOrganizations = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.get('/organization', { params });
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  // --- GET ORGANIZATION BY ID ---
  const getOrganizationById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.get(`/organization/get-id/${id}`);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  // --- CREATE ORGANIZATION ---
  const createOrganization = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.post('/organization/post', payload);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err; 
    } finally {
      setLoading(false);
    }
  };

  // --- UPDATE ORGANIZATION ---
  const updateOrganization = async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.put(`/organization/update/${id}`, payload);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE ORGANIZATION ---
  const removeOrganization = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.delete(`/organization/delete/${id}`);
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
    getAllOrganizations,
    getOrganizationById,
    createOrganization,
    updateOrganization,
    removeOrganization,
  };
};