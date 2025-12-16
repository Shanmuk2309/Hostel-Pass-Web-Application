const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection (Replace 'hostel_db' with your local or Atlas URI)
mongoose.connect('mongodb://127.0.0.1:27017/hostel_db')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// --- Schemas & Models ---

const StudentSchema = new mongoose.Schema({
    name: String,
    studentId: { type: String, unique: true }, // Username
    email: String,
    password: String, // Note: In production, hash this with bcrypt!
    dob: Date,
    hostelName: String,
    roomNo: String
});
const Student = mongoose.model('Student', StudentSchema);

const WardenSchema = new mongoose.Schema({
    name: String,
    wardenId: { type: String, unique: true }, // Username
    email: String,
    password: String,
    dob: Date,
    salary: Number
});
const Warden = mongoose.model('Warden', WardenSchema);

const OutpassSchema = new mongoose.Schema({
    studentId: String,
    studentName: String,
    hostelName: String,
    fromDate: Date,
    toDate: Date,
    reason: String,
    status: { type: String, default: "Pending" } // Pending, Approved, Rejected
});
const Outpass = mongoose.model('Outpass', OutpassSchema);

// --- Routes ---

// 1. Register
app.post('/register', async (req, res) => {
    const { role, ...data } = req.body;
    try {
        if (role === 'student') {
            const newStudent = new Student(data);
            await newStudent.save();
        } else {
            const newWarden = new Warden(data);
            await newWarden.save();
        }
        res.json({ message: "Registration Successful" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Login
app.post('/login', async (req, res) => {
    const { username, password, role } = req.body;
    try {
        let user;
        if (role === 'student') {
            user = await Student.findOne({ studentId: username, password: password });
        } else {
            user = await Warden.findOne({ wardenId: username, password: password });
        }

        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Create Outpass (Student)
app.post('/outpass/create', async (req, res) => {
    try {
        const { studentId, studentName, hostelName, fromDate, toDate, reason } = req.body;

        // 1️⃣ Check for empty fields
        if (!studentId || !studentName || !hostelName || !fromDate || !toDate || !reason) {
            return res.status(400).json({
                error: "All outpass details are required"
            });
        }

        // 2️⃣ Date validation
        if (new Date(toDate) < new Date(fromDate)) {
            return res.status(400).json({
                error: "To Date cannot be earlier than From Date"
            });
        }

        const outpass = new Outpass({
            studentId,
            studentName,
            hostelName,
            fromDate,
            toDate,
            reason
        });

        await outpass.save();
        res.json({ message: "Outpass Requested" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 4. Get Student's Outpasses
app.get('/outpass/student/:studentId', async (req, res) => {
    try {
        const outpasses = await Outpass.find({ studentId: req.params.studentId });
        res.json(outpasses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Get All Pending Outpasses (Warden)
app.get('/outpass/warden', async (req, res) => {
    try {
        const outpasses = await Outpass.find({ status: "Pending" });
        res.json(outpasses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Update Outpass Status (Warden)
app.put('/outpass/update/:id', async (req, res) => {
    try {
        const { status } = req.body;
        await Outpass.findByIdAndUpdate(req.params.id, { status: status });
        res.json({ message: `Outpass ${status}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//Delete Multiple Outpasses
app.post('/outpass/delete-many', async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: "No IDs provided" });
        }
        await Outpass.deleteMany({ _id: { $in: ids } });
        res.json({ message: "Selected outpasses deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(5000, () => console.log('Server running on port 5000'));