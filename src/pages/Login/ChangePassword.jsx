import React, { useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthProvider";

const ChangePasswordForm = () => {
  const { changePassword } = useContext(AuthContext);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset messages
    setMessage("");
    setError("");

    // Validate new password length
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    // Check if new password matches confirm new password
    if (newPassword !== confirmNewPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      const result = await changePassword(oldPassword, newPassword);
      setMessage(result.message); // Show success message
    } catch (error) {
      if (error.response?.status === 401) {
        setError("Incorrect old password.");
      } else if (error.response?.status === 402 || error.response?.status === 403) {
        setError("Error changing password.");
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Change Password</h2>
      <div>
        <label htmlFor="oldPassword">Old Password:</label>
        <input
          type="password"
          id="oldPassword"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="newPassword">New Password:</label>
        <input
          type="password"
          id="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="confirmNewPassword">Confirm New Password:</label>
        <input
          type="password"
          id="confirmNewPassword"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit">Change Password</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
    </form>
  );
};

export default ChangePasswordForm;
