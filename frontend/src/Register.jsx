import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
    const navigate = useNavigate();
    const [role, setRole] = useState('student');
    const [formData, setFormData] = useState({
        name: '', userId: '', email: '', password: '', dob: '',
        hostelName: '', roomNo: '', salary: ''
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleRegister = async () => {
        if (!formData.name || !formData.userId || !formData.password) return alert("Fill required fields");
        const payload = {
            role, ...formData,
            ...(role === 'student' 
                ? { studentId: formData.userId } 
                : { wardenId: formData.userId }
            )
        };
        try {
            await axios.post('http://localhost:5000/register', payload);
            alert("Registration Successful!");
            navigate('/login');
        } catch (err) { alert("Error: " + err.message); }
    };

    return (
        <div className="auth-container">
            <h2 className="auth-header">Register</h2>
            <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="warden">Warden</option>
            </select>
            
            <input className="form-input" name="name" placeholder="Full Name" onChange={handleChange} />
            <input className="form-input" name="userId" placeholder={role === 'student' ? "Student ID" : "Warden ID"} onChange={handleChange} />
            <input className="form-input" name="email" placeholder="Email" onChange={handleChange} />
            <input className="form-input" name="password" type="password" placeholder="Password" onChange={handleChange} />
            <input className="form-input" name="dob" type="date" onChange={handleChange} />

            {role === 'student' ? (
                <>
                    <input className="form-input" name="hostelName" placeholder="Hostel Name" onChange={handleChange} />
                    <input className="form-input" name="roomNo" placeholder="Room No" onChange={handleChange} />
                </>
            ) : (
                <input className="form-input" name="salary" placeholder="Salary" onChange={handleChange} />
            )}

            <button className="form-btn" style={{marginTop: '15px'}} onClick={handleRegister}>Register</button>
            <Link to="/login" className="link-text">Back to Login</Link>
        </div>
    );
}
export default Register;