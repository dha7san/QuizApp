import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './auth.css';

/* ── SVG icons ─────────────────────────────────────────── */
const IconEyeOpen = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
);
const IconEyeClosed = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
);

/* ── Reusable field component ───────────────────────────── */
const Field = ({ id, label, type = 'text', value, onChange, autoComplete,
                 showToggle = false, showPw = false, onToggle }) => (
    <div className="saas-field">
        <label className="saas-label" htmlFor={id}>{label}</label>
        <div className="saas-input-wrap">
            <input
                id={id}
                className={`saas-input${showToggle ? ' has-eye' : ''}`}
                type={type === 'password' ? (showPw ? 'text' : 'password') : type}
                value={value}
                onChange={onChange}
                placeholder={label}
                required
                autoComplete={autoComplete}
            />
            {showToggle && (
                <button type="button" className="eye-toggle"
                    onClick={onToggle} tabIndex={-1}
                    aria-label={showPw ? 'Hide password' : 'Show password'}>
                    {showPw ? <IconEyeOpen /> : <IconEyeClosed />}
                </button>
            )}
        </div>
    </div>
);

/* ── Auth component ─────────────────────────────────────── */
const Auth = () => {
    const [isToggled, setIsToggled] = useState(false);

    /* sign-in */
    const [loginUser, setLoginUser]       = useState('');
    const [loginPass, setLoginPass]       = useState('');
    const [showLoginPw, setShowLoginPw]   = useState(false);
    const [loginError, setLoginError]     = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    /* sign-up */
    const [regName, setRegName]           = useState('');
    const [regEmail, setRegEmail]         = useState('');
    const [regPass, setRegPass]           = useState('');
    const [showRegPw, setShowRegPw]       = useState(false);
    const [regError, setRegError]         = useState('');
    const [regLoading, setRegLoading]     = useState(false);

    /* registration gate */
    const [regOpen, setRegOpen]           = useState(true);
    const [checkingReg, setCheckingReg]   = useState(true);

    const { login, register } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setIsToggled(location.pathname === '/register');
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/settings`)
            .then(r  => setRegOpen(r.data.registrationOpen))
            .catch(() => setRegOpen(true))
            .finally(() => setCheckingReg(false));
    }, [location.pathname]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        setLoginLoading(true);
        const res = await login(loginUser, loginPass);
        if (!res.success) setLoginError(res.message);
        else navigate('/');
        setLoginLoading(false);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setRegError('');
        setRegLoading(true);
        const res = await register(regName, regEmail, regPass, 'user');
        if (!res.success) {
            setRegError(res.message || 'Registration failed');
        } else {
            setIsToggled(false);
            setLoginUser(regEmail);
            navigate('/login', { replace: true });
        }
        setRegLoading(false);
    };

    const goToRegister = (e) => { e.preventDefault(); setIsToggled(true);  navigate('/register', { replace: true }); };
    const goToLogin    = (e) => { e.preventDefault(); setIsToggled(false); navigate('/login',    { replace: true }); };

    return (
        <div className="auth-page-container">
            <div className={`auth-wrapper${isToggled ? ' toggled' : ''}`}>

                {/* ── Diagonal teal decoration panel ── */}
                <div className="deco-panel">
                    {/* "WELCOME BACK!" — shown on right when sign-in is active */}
                    <div className="deco-text signin">
                        <h2>WELCOME<br/>BACK!</h2>
                    </div>
                    {/* "SHREE VENKATESHWARA..." — shown on left when sign-up is active */}
                    <div className="deco-text signup">
                        <h2>SHREE VENKATESHWARA<br/>HI-TECH ENGINEERING<br/>COLLEGE</h2>
                    </div>
                </div>

                {/* ════════════════ SIGN-IN FORM ════════════════ */}
                <div className="form-panel signin">
                    <div className="form-inner">
                        <h2 className="panel-title">Welcome back</h2>
                        <p  className="panel-sub">Sign in to your account</p>

                        {loginError && (
                            <div className="auth-error">{loginError}</div>
                        )}

                        <form className="auth-form" onSubmit={handleLogin} noValidate>
                            <Field
                                id="login-username"
                                label="Username"
                                type="text"
                                value={loginUser}
                                onChange={e => setLoginUser(e.target.value)}
                                autoComplete="username"
                            />
                            <Field
                                id="login-password"
                                label="Password"
                                type="password"
                                value={loginPass}
                                onChange={e => setLoginPass(e.target.value)}
                                autoComplete="current-password"
                                showToggle
                                showPw={showLoginPw}
                                onToggle={() => setShowLoginPw(v => !v)}
                            />
                            <button className="submit-button" type="submit" disabled={loginLoading}>
                                {loginLoading ? 'Signing in…' : 'Sign in'}
                            </button>
                            <div className="switch-link">
                                Don't have an account?{' '}
                                <a href="#" onClick={goToRegister}>Sign up</a>
                            </div>
                        </form>
                    </div>
                </div>

                {/* ════════════════ SIGN-UP FORM ════════════════ */}
                <div className="form-panel signup">
                    <div className="form-inner">
                        {!checkingReg && !regOpen ? (
                            /* registration closed state */
                            <>
                                <h2 className="panel-title" style={{ color: '#f87171' }}>
                                    Registration Closed
                                </h2>
                                <p className="panel-sub" style={{ marginBottom: 24 }}>
                                    The administrator has closed registration.<br/>
                                    Please contact your instructor for access.
                                </p>
                                <button className="submit-button" type="button" onClick={goToLogin}>
                                    Go to Login
                                </button>
                            </>
                        ) : (
                            <>
                                <h2 className="panel-title">Create account</h2>
                                <p  className="panel-sub ">Join the SVHEC quiz portal</p>

                                {regError && (
                                    <div className="auth-error">{regError}</div>
                                )}

                                <form className="auth-form" onSubmit={handleRegister} noValidate>
                                    <Field
                                        id="reg-name"
                                        label="Full name"
                                        type="text"
                                        value={regName}
                                        onChange={e => setRegName(e.target.value)}
                                        autoComplete="name"
                                    />
                                    <Field
                                        id="reg-email"
                                        label="Email address"
                                        type="email"
                                        value={regEmail}
                                        onChange={e => setRegEmail(e.target.value)}
                                        autoComplete="email"
                                    />
                                    <Field
                                        id="reg-password"
                                        label="Password"
                                        type="password"
                                        value={regPass}
                                        onChange={e => setRegPass(e.target.value)}
                                        autoComplete="new-password"
                                        showToggle
                                        showPw={showRegPw}
                                        onToggle={() => setShowRegPw(v => !v)}
                                    />
                                    <button className="submit-button" type="submit" disabled={regLoading}>
                                        {regLoading ? 'Creating account…' : 'Create account'}
                                    </button>
                                    <div className="switch-link">
                                        Already have an account?{' '}
                                        <a href="#" onClick={goToLogin}>Sign in</a>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>

            </div>

            <div className="auth-footer">
                SVHEC Quiz Portal &nbsp;·&nbsp;{' '}
                <a href="#" target="_blank" rel="noreferrer">SVHEC</a>
            </div>
        </div>
    );
};

export default Auth;
