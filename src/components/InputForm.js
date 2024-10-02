import React, { useState } from 'react';
import { db, storage } from '../firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Report.css';
import { FaCircleUser } from "react-icons/fa6";
import { renderToString } from 'react-dom/server';


const InputForm = () => {
  const [formData, setFormData] = useState({
    nameSurname: '',
    documentDate: '',
    startDate: '',
    endDate: '',
    amount: '',
    place: '',
    idCardNumber: '',
    avatarUrl: ''
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = '';
      if (image) {
        const imageRef = ref(storage, `avatars/${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      } else {
        imageUrl = `data:image/svg+xml;base64,${btoa(renderToString(<FaCircleUser />))}`;

      }
      const formattedDuration = `${new Date(formData.startDate).toLocaleDateString('en-GB')} to ${new Date(formData.endDate).toLocaleDateString('en-GB')}`;
      await addDoc(collection(db, 'reports'), {
        ...formData,
        duration: formattedDuration,
        avatarUrl: imageUrl,
        timestamp: serverTimestamp(),
      });
      navigate('/report');
    } catch (error) {
      console.error('Error adding document: ', error);
    } finally {
      setLoading(false);
    }
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
        <div className="frosted-content">
        <h1 style={{ color: 'blue' }}>Generate Report</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name & Surname</label>
            <input
              type="text"
              name="nameSurname"
              value={formData.nameSurname}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Document Date</label>
            <input
              type="date"
              name="documentDate"
              value={formData.documentDate}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Place</label>
            <input
              type="text"
              name="place"
              value={formData.place}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>ID Card Number</label>
            <input
              type="text"
              name="idCardNumber"
              value={formData.idCardNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Profile Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>
          <button type="submit" className="btn btn-success">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default InputForm;
