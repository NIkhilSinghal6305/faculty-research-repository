import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', facultyCode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Name, email and password are required.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.role === 'faculty' && !form.facultyCode.trim()) {
      setError('Enter the faculty invite code.');
      return;
    }
    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === 'faculty' ? '/dashboard' : '/');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="narrow">
      <h1>Register</h1>
      <form className="form" onSubmit={handleSubmit}>
        {error && <p className="alert alert-error">{error}</p>}
        <label>Name
          <input name="name" value={form.name} onChange={handleChange} />
        </label>
        <label>Email
          <input type="email" name="email" value={form.email} onChange={handleChange} />
        </label>
        <label>Password (min 6 characters)
          <input type="password" name="password" value={form.password} onChange={handleChange} />
        </label>
        <label>I am a
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="student">Student / visitor</option>
            <option value="faculty">Faculty member</option>
          </select>
        </label>
        {form.role === 'faculty' && (
          <label>Faculty invite code
            <input name="facultyCode" value={form.facultyCode} onChange={handleChange} />
          </label>
        )}
        <button className="btn btn-primary" disabled={loading}>{loading ? 'Creating account...' : 'Register'}</button>
      </form>
      <p>Already registered? <Link to="/login">Login</Link></p>
    </div>
  );
}

export default Register;
