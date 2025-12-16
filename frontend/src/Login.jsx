import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const navigate = useNavigate();

    const handleLogin = async () => {
        if(!username || !password) return alert("Please fill all fields");
        try {
            const res = await axios.post('http://localhost:5000/login', { username, password, role });
            if (res.data.success) {
                localStorage.setItem('user', JSON.stringify(res.data.user));
                if (role === 'student') navigate('/student-dashboard');
                else navigate('/warden-dashboard');
            } else {
                alert("Invalid Credentials");
            }
        } catch (err) { console.error(err); alert("Login Error"); }
    };

    return (
        <div className="auth-container">
            <h2 className="auth-header">Hostel Login</h2>
            <div className="form-group">
                <label>Select Role:</label>
                <select className="form-select" onChange={(e) => setRole(e.target.value)}>
                    <option value="student">Student</option>
                    <option value="warden">Warden</option>
                </select>
            </div>
            <div className="form-group">
                <input className="form-input" placeholder="Username / ID" onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="form-group">
                <input className="form-input" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button className="form-btn" onClick={handleLogin}>Login</button>
            <Link to="/register" className="link-text">New User? Register here</Link>
        </div>
    );
}
export default Login;