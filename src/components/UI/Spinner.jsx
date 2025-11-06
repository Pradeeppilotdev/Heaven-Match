// src/components/UI/Spinner.jsx
import React from 'react';
import '../../styles/Spinner.css'; // Import CSS
//used to simulate loading pattern
const Spinner = () => {
    return (
        <div className="spinner-dot-pulse">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
        </div>
    );
};

export default Spinner;