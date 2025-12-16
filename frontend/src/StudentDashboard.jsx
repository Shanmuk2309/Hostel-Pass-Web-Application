import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function StudentDashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [outpasses, setOutpasses] = useState([]);
    const [form, setForm] = useState({ reason: '', fromDate: '', toDate: '' });
    
    // 1. New State for tracking selected items
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        if(!user) navigate('/login');
        else axios.get(`http://localhost:5000/outpass/student/${user.studentId}`)
            .then(res => setOutpasses(res.data))
            .catch(err => console.log(err));
    }, [user, navigate]);

    const handleSubmit = async () => {
    if (!form.reason || !form.fromDate || !form.toDate) {
        alert("Please fill all outpass details before submitting.");
        return;
    }

    try {
        await axios.post('http://localhost:5000/outpass/create', {
            ...form,
            studentId: user.studentId,
            studentName: user.name,
            hostelName: user.hostelName
        });

        alert("Requested!");
        window.location.reload();

    } catch (err) {
        alert(err.response?.data?.error || "Something went wrong");
    }
};


    // 2. Function to handle checkbox toggles
    const handleCheckboxChange = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // 3. Function to delete selected items from Database and UI
    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) {
            alert("Please select at least one item to delete.");
            return;
        }

        const confirmDelete = window.confirm("Are you sure you want to delete the selected history?");
        if (!confirmDelete) return;

        try {
            // Sends the list of IDs to the backend to delete
            await axios.post('http://localhost:5000/outpass/delete-many', { ids: selectedIds });
            
            // Remove deleted items from the UI state immediately
            setOutpasses(outpasses.filter(op => !selectedIds.includes(op._id)));
            setSelectedIds([]); // Clear selection
            alert("Selected history deleted successfully.");
        } catch (err) {
            console.error("Error deleting:", err);
            alert("Failed to delete. Check console.");
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>Welcome, {user?.name}</h2>
                <button className="logout-btn" onClick={() => { localStorage.clear(); navigate('/login'); }}>Logout</button>
            </div>

            <div className="auth-container" style={{ margin: '0 0 30px 0', maxWidth: '100%', boxShadow: 'none', border: '1px solid #ddd' }}>
                <h3>Apply for Outpass</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input className="form-input" type="date" onChange={(e) => setForm({...form, fromDate: e.target.value})} />
                    <input className="form-input" type="date" onChange={(e) => setForm({...form, toDate: e.target.value})} />
                </div>
                <input className="form-input" placeholder="Reason" onChange={(e) => setForm({...form, reason: e.target.value})} />
                <button className="form-btn" style={{marginTop: '10px'}} onClick={handleSubmit}>Apply Request</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>My History</h3>
                {/* 4. Only show Delete button if items are selected */}
                {selectedIds.length > 0 && (
                    <button 
                        onClick={handleDeleteSelected}
                        style={{ backgroundColor: '#ff4d4d', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Delete Selected ({selectedIds.length})
                    </button>
                )}
            </div>

            <ul className="outpass-list">
                {outpasses.map(op => (
                    <li key={op._id} className="outpass-card" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* 5. Checkbox for selection */}
                        <input 
                            type="checkbox" 
                            checked={selectedIds.includes(op._id)}
                            onChange={() => handleCheckboxChange(op._id)}
                            style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                            <strong>{op.reason}</strong><br/>
                            <small>{op.fromDate.split('T')[0]} to {op.toDate.split('T')[0]}</small>
                        </div>
                        <span className={`status-badge status-${op.status}`}>{op.status}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
export default StudentDashboard;