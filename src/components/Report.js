import React, { useEffect, useState } from 'react';
import { db, storage } from '../firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './Report.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import { FaAngleDoubleDown } from "react-icons/fa";

const Report = () => {
  const [reports, setReports] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [lastEditTime, setLastEditTime] = useState('');
  const [editSuccessMessage, setEditSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);  // New state for saving indicator
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [newAvatar, setNewAvatar] = useState(null); // New state for the avatar file
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const reportsCollection = collection(db, 'reports');
      const querySnapshot = await getDocs(reportsCollection);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort the reports by timestamp (latest first) by default
      const sortedData = data.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
      setReports(sortedData);
      setLoading(false);
    };

    fetchData();

    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const formatDate = (timestamp) => {
    const date = timestamp ? new Date(timestamp.seconds * 1000) : null;
    return date ? date.toLocaleString() : 'No date available';
  };

  const handleEdit = (report) => {
    setIsEditing(true);
    setEditData(report);
    setEditSuccessMessage('');
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleSave = async () => {
    if (editData) {
      setIsSaving(true);  // Set the saving state to true when the save starts
      const reportRef = doc(db, 'reports', editData.id);
      
      // If a new avatar is selected, upload it to Firebase Storage
      let avatarUrl = editData.avatarUrl;
      if (newAvatar) {
        const avatarRef = ref(storage, `avatars/${editData.id}-${newAvatar.name}`);
        await uploadBytes(avatarRef, newAvatar);
        avatarUrl = await getDownloadURL(avatarRef);
      }

      await updateDoc(reportRef, { ...editData, avatarUrl, timestamp: new Date() });
      
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === editData.id ? { ...report, ...editData, avatarUrl } : report
        )
      );
      setIsEditing(false);
      setLastEditTime(new Date().toLocaleString());
      setEditSuccessMessage('ข้อมูลได้รับการแก้ไขเรียบร้อยแล้ว!');
      setNewAvatar(null); 
      setIsSaving(false);  
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleAvatarChange = (e) => {
    if (e.target.files[0]) {
      setNewAvatar(e.target.files[0]);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("คุณต้องการลบข้อมูลนี้ใช่ไหม?");
    if (confirmDelete) {
      const reportRef = doc(db, 'reports', id);
      await deleteDoc(reportRef);
      setReports(reports.filter(report => report.id !== id));
    }
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  const sortReports = (criteria) => {
    const sortedReports = [...reports].sort((a, b) => {
      if (criteria === 'latest') {
        return b.timestamp.seconds - a.timestamp.seconds; // Sort by the most recent timestamp
      }
      if (criteria === 'date') {
        return new Date(b.documentDate) - new Date(a.documentDate);
      }
      if (criteria === 'name') {
        return a.nameSurname.localeCompare(b.nameSurname);
      }
      if (criteria === 'amount') {
        return b.amount - a.amount;
      }
      return 0;
    });
    setReports(sortedReports);
  };

  const handleSortChange = (e) => {
    sortReports(e.target.value);
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container">
        <h1 style={{ color:'red'}}>Report History</h1>
        <button onClick={handleBack} className="btn btn-secondary mb-3">
          Back to Home
        </button>
        {lastEditTime && <p className="last-edit-time">แก้ไขล่าสุดเมื่อ: {lastEditTime}</p>}
        {editSuccessMessage && <p className="edit-success-message" style={{ color: 'green' }}>{editSuccessMessage}</p>}
        
        <div className="mb-3">
          <label htmlFor="sort-select" className="form-label">Sort by:</label>
          <select id="sort-select" className="form-select" onChange={handleSortChange}>
            <option value="latest">Latest (Default)</option>
            <option value="date">Document Date</option>
            <option value="name">Name</option>
            <option value="amount">Amount</option>
          </select>
        </div>

        {reports.length === 0 ? (
          <p>No reports available</p>
        ) : (
          reports.map((report) => (
            <div className="report" key={report.id}>
              <div className="avatar-container">
                <img src={report.avatarUrl} alt="Avatar" className="avatar" />
              </div>
              {isEditing && editData.id === report.id ? (
                <>
                  <input
                    type="text"
                    name="nameSurname"
                    value={editData.nameSurname}
                    onChange={handleChange}
                    placeholder="Name + Surname"
                  />
                  <input
                    type="date"
                    name="documentDate"
                    value={editData.documentDate.split('T')[0]}
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    name="duration"
                    value={editData.duration}
                    onChange={handleChange}
                    placeholder="Duration"
                  />
                  <input
                    type="number"
                    name="amount"
                    value={editData.amount}
                    onChange={handleChange}
                    placeholder="Amount"
                  />
                  <input
                    type="text"
                    name="place"
                    value={editData.place}
                    onChange={handleChange}
                    placeholder="Place"
                  />
                  <input
                    type="text"
                    name="idCardNumber"
                    value={editData.idCardNumber}
                    onChange={handleChange}
                    placeholder="ID Card Number"
                  />
                  <div>
                    <label>Change Avatar: </label>
                    <input type="file" onChange={handleAvatarChange} />
                  </div>

                  {/* Show loading spinner while saving */}
                  {isSaving ? (
                    <div className="loading-overlay">
                      <div className="loading-spinner"></div>
                      <p>Saving...</p>
                    </div>
                  ) : (
                    <button onClick={handleSave} className="btn btn-success">Save</button>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <label>Name & Surname: </label>
                    <span>{report.nameSurname}</span>
                  </div>
                  <div>
                    <label>Document Date: </label>
                    <span>{report.documentDate}</span>
                  </div>
                  <div>
                    <label>Duration: </label>
                    <span>{report.duration}</span>
                  </div>
                  <div>
                    <label>Amount: </label>
                    <span>{report.amount}</span>
                  </div>
                  <div>
                    <label>Place: </label>
                    <span>{report.place}</span>
                  </div>
                  <div>
                    <label>ID Card Number: </label>
                    <span>{report.idCardNumber}</span>
                  </div>
                  <button onClick={() => handleEdit(report)} className="btn btn-primary">Edit</button>
                  <button onClick={() => handleDelete(report.id)} className="btn btn-danger">Delete</button>
                </>
              )}
              <div>
                <label>Submitted At: </label>
                <span>{formatDate(report.timestamp)}</span>
              </div>
            </div>
          ))
        )}
        
        {showScrollButton && (
          <button 
          className="nav-menu flex items-center"
            onClick={scrollToBottom}
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              zIndex: 1000,
            }}
          ><FaAngleDoubleDown /> 
          </button>
        )}
      </div>
  );
};

export default Report;
