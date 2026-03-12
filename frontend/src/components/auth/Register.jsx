import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './auth.css';
import './register.css';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Check registration status from backend
    const [open, setOpen] = useState(true);
    const [checking, setChecking] = useState(true);

    const location = useLocation();
    const incoming = location.state?.incoming;
    
    // Mount toggled if incoming to trigger transition animations perfectly without lag
    const [isToggled, setIsToggled] = useState(false);
    
    const shapeStyle = (incoming && isToggled) ? { transitionDelay: '0s' } : {};

    const { register } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/settings`)
            .then(r => setOpen(r.data.registrationOpen))
            .catch(() => setOpen(true))
            .finally(() => setChecking(false));
            
        // Triggers the CSS slide transition after mounting
        const timer = setTimeout(() => {
            setIsToggled(true);
        }, 50);
        return () => clearTimeout(timer);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await register(name, email, password, 'user');
        if (!result.success) {
            setError(result.message || 'Registration failed');
        } else {
             navigate('/login');
        }
        setLoading(false);
    };
    
    // Preserving the closed state UI using the new generic wrapper
    if (!checking && !open) {
        return (
            <div className="auth-page-container">
                <div className="auth-wrapper toggled">
                    <div className="background-shape" style={shapeStyle}></div>
                    <div className="secondary-shape" style={shapeStyle}></div>
                    
                    <div className="credentials-panel signup">
                         <h2 className="slide-element" style={{ color: '#ff4d4d', marginTop: 30 }}>Registration Closed</h2>
                         <p className="slide-element" style={{ textAlign: 'center', marginBottom: 20 }}>
                            The administrator has closed registration.<br/>Please contact your instructor for access.
                         </p>
                         
                         <div className="field-wrapper slide-element">
                             <Link to="/login" style={{ width: '100%', textDecoration: 'none' }}>
                                 <button className="submit-button" type="button">
                                     Go to Login
                                 </button>
                             </Link>
                         </div>
                    </div>
                </div>
            </div>
        );
    }

    if (checking) return null;

    return (
        <div className="auth-page-container">
            <div className={`auth-wrapper ${isToggled ? 'toggled' : ''}`}>
                <div className="background-shape" style={shapeStyle}></div>
                <div className="secondary-shape" style={shapeStyle}></div>

                <div className="credentials-panel signup">
                    <h2 className="slide-element">Register</h2>

                    {error && <div className="slide-element" style={{ color: '#ff4d4d', textAlign: 'center', marginBottom: 5, background: 'rgba(255,0,0,0.1)', padding: 10, borderRadius: 5, border: '1px solid rgba(255,0,0,0.3)' }}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="field-wrapper slide-element">
                            <input 
                                type="text" 
                                required 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <label>Username</label>
                            <i className="fa-solid fa-user"></i>
                        </div>

                        <div className="field-wrapper slide-element">
                            <input 
                                type="email" 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <label>Email</label>
                            <i className="fa-solid fa-envelope"></i>
                        </div>

                        <div className="field-wrapper slide-element">
                            <input 
                                type="password" 
                                required 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <label>Password</label>
                            <i className="fa-solid fa-lock"></i>
                        </div>

                        <div className="field-wrapper slide-element">
                            <button className="submit-button" type="submit" disabled={loading}>
                                {loading ? 'Registering...' : 'Register'}
                            </button>
                        </div>

                        <div className="switch-link slide-element">
                            <p>
                                Already have an account? <br/> 
                                <a 
                                    href="#" 
                                    className="login-trigger"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setIsToggled(false);
                                        setTimeout(() => navigate('/login', { state: { incoming: true } }), 1200);
                                    }}
                                >
                                    Sign In
                                </a>
                            </p>
                        </div>
                    </form>
                </div>

                <div className="welcome-section signup">
                    <h2 className="slide-element">WELCOME!</h2>
                </div>
            </div>

            <div className="auth-footer">
                <p>Made with ❤️ by <a href="#" target="_blank" rel="noreferrer">SVHEC</a></p>
            </div>
        </div>
    );
};

export default Register;
