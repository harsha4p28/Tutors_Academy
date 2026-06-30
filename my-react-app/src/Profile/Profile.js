import React, { useContext, useEffect, useState } from 'react';
import "./Profile.css";
import AuthContext from '../context/AuthProvider';
import axios from '../api/axios';
import { ClipLoader } from 'react-spinners';

const Profile = () => {
  const { setAuth } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Password Modal states
  const [showModal, setShowModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const handleProfile = async () => {
    try {
      const response = await axios.get('/profile', { withCredentials: true });
      setProfileData(response.data);
    } catch (error) {
      console.error("Error fetching profile data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/logout', {}, { withCredentials: true });
      setAuth(null);
      window.location.reload(); 
      window.location.href = '/';
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setModalError("");
    setModalSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setModalError("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setModalError("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setModalError("New password must be at least 6 characters long");
      return;
    }

    setModalLoading(true);
    try {
      await axios.post('/profile/change-password', {
        currentPassword,
        newPassword
      }, { withCredentials: true });

      setModalSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setShowModal(false);
        setModalSuccess("");
      }, 1500);
    } catch (error) {
      setModalError(error.response?.data?.message || "Failed to update password");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    loading ? (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <ClipLoader size={80} color={"#88BDA4"} loading={true} />
      </div>
    ) : profileData ? (
      <div className='profileMainContainer'>
        <div className='profileContainer'>
          <h1>Profile</h1>
          <div className='profileDetails'>
            <h2>Profile Details</h2>
            <p><strong>Name:</strong> {profileData.user.name}</p>
            <p><strong>Email:</strong> {profileData.user.email}</p>
            <p><strong>Phone:</strong> {profileData.user.phone}</p>
            <p><strong>Address:</strong> {profileData.user.address}</p>
            <p><strong>City:</strong> {profileData.user.city}</p>
            <p><strong>State:</strong> {profileData.user.state}</p>
          </div>
          <div className='profileActions'>
            <button onClick={() => setShowModal(true)}>Change Password</button>
          </div>
          <div className='ProfileLogout'>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>

        {/* Change Password Modal */}
        {showModal && (
          <div className="passwordModalOverlay">
            <div className="passwordModalContainer">
              <span className="closeModalIcon" onClick={() => setShowModal(false)}>&times;</span>
              <h2>Change Password</h2>
              
              {modalError && <div className="modalAlert error">{modalError}</div>}
              {modalSuccess && <div className="modalAlert success">{modalSuccess}</div>}

              <form onSubmit={handlePasswordSubmit} className="modalForm">
                <div className="modalField">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="modalField">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="modalField">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" disabled={modalLoading}>
                  {modalLoading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    ) : <></>
  );
}

export default Profile;