import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function WardenDashboard() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/outpass/warden')
            .then(res => setRequests(res.data))
            .catch(err => console.log(err));
    }, []);

    const updateStatus = async (id, status) => {
        await axios.put(`http://localhost:5000/outpass/update/${id}`, { status });
        setRequests(requests.filter(req => req._id !== id));
    };

    return (
        <div className="dashboard-container">
             <div className="dashboard-header">
                <h2>Warden Dashboard</h2>
                <button className="logout-btn" onClick={() => { localStorage.clear(); navigate('/login'); }}>Logout</button>
            </div>

            <h3>Pending Requests</h3>
            {requests.length === 0 ? <p>No pending requests.</p> : 
                <ul className="outpass-list">
                    {requests.map(req => (
                        <li key={req._id} className="outpass-card">
                            <div>
                                <strong>{req.studentName} ({req.studentId})</strong>
                                <p style={{margin: '5px 0'}}>{req.reason}</p>
                                <small>From: {req.fromDate.split('T')[0]} To: {req.toDate.split('T')[0]}</small>
                            </div>
                            <div>
                                <button className="action-btn approve-btn" onClick={() => updateStatus(req._id, "Approved")}>Accept</button>
                                <button className="action-btn reject-btn" onClick={() => updateStatus(req._id, "Rejected")}>Reject</button>
                            </div>
                        </li>
                    ))}
                </ul>
            }
        </div>
    );
}
export default WardenDashboard;