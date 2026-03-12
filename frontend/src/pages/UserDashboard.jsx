import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [joinCode, setJoinCode] = useState('');
    const [joining, setJoining] = useState(false);
    const [joinError, setJoinError] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/api/quiz`, { headers: { Authorization: `Bearer ${user.token}` } })
            .then(r => setQuizzes(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user.token]);

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!joinCode.trim()) return;
        setJoining(true); setJoinError('');
        try {
            const r = await axios.post(`${import.meta.env.VITE_API_URL}/api/quiz/verify-code`,
                { quizCode: joinCode },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            navigate(`/quiz/${r.data.quizId}`);
        } catch (err) {
            setJoinError(err.response?.data?.message || 'Invalid code or quiz not available.');
        } finally { setJoining(false); }
    };

    const formatTime = (t) => {
        if (!t) return null;
        const d = new Date(t), now = new Date(), diff = d - now;
        if (diff < 0) return { text: 'Started', color: 'var(--color-success)' };
        if (diff < 10 * 60000) return { text: `Starts in ${Math.ceil(diff / 60000)}m`, color: 'var(--color-warning)' };
        return { text: d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }), color: 'var(--color-text-secondary)' };
    };

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="page-in">
            {/* Welcome Row */}
            <div style={{ marginBottom: 28, display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
                        {greeting}, {user.name?.split(' ')[0]} 👋
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
                        SVHEC Quiz Portal · {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button className="btn btn-ghost btn-sm btn-pill" onClick={() => navigate('/my-results')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        My Results
                    </button>
                    <button className="btn btn-primary btn-sm btn-pill" onClick={() => navigate('/leaderboard')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Leaderboard
                    </button>
                </div>
            </div>

            {/* Join Box */}
            <div style={{
                borderRadius: 24, marginBottom: 36, overflow: 'hidden',
                background: 'linear-gradient(140deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)',
                padding: 'clamp(24px,5vw,36px)',
            }}>
                <div style={{ maxWidth: 540 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(108,99,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                            🔑
                        </div>
                        <div>
                            <h2 style={{ color: 'white', fontWeight: 700, fontSize: 17, marginBottom: 3 }}>Enter Quiz Code</h2>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Get the code from your instructor or admin</p>
                        </div>
                    </div>

                    <form onSubmit={handleJoin}>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                placeholder="e.g.  ECE2026"
                                value={joinCode}
                                onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinError(''); }}
                                style={{
                                    flex: '1 1 180px', minWidth: 140, padding: '13px 18px',
                                    background: 'rgba(255,255,255,0.1)', border: joinError ? '1.5px solid rgba(255,80,70,0.6)' : '1.5px solid rgba(255,255,255,0.14)',
                                    borderRadius: 14, color: 'white', fontSize: 17, fontWeight: 700,
                                    letterSpacing: '0.1em', fontFamily: 'inherit', outline: 'none',
                                    transition: 'border-color 160ms',
                                }}
                            />
                            <button type="submit" disabled={joining} style={{
                                padding: '13px 26px', borderRadius: 14, border: 'none',
                                background: joining ? 'rgba(255,255,255,0.2)' : 'white',
                                color: joining ? 'rgba(255,255,255,0.5)' : 'var(--brand-accent)',
                                fontWeight: 700, fontSize: 15, fontFamily: 'inherit',
                                cursor: joining ? 'not-allowed' : 'pointer',
                                transition: 'all 200ms ease', whiteSpace: 'nowrap',
                                flexShrink: 0,
                            }}>
                                {joining ? 'Joining…' : 'Join Quiz →'}
                            </button>
                        </div>
                        {joinError && <p style={{ marginTop: 10, color: '#ff9f9b', fontSize: 13 }}>⚠ {joinError}</p>}
                    </form>
                </div>
            </div>

            {/* Active Quizzes */}
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, letterSpacing: '-0.01em' }}>Active Quizzes</h2>
            {loading ? (
                <div className="grid-auto">
                    {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 20 }} />)}
                </div>
            ) : quizzes.length === 0 ? (
                <div className="card" style={{ padding: '52px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: 44, marginBottom: 14 }}>⏰</div>
                    <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>No active quizzes</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Check back soon, or use a quiz code above to join directly.</p>
                </div>
            ) : (
                <div className="grid-auto">
                    {quizzes.map(quiz => {
                        const ti = formatTime(quiz.startTime);
                        return (
                            <div key={quiz._id} className="card card-hover" style={{ padding: 22 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(108,99,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="22" height="22" fill="none" stroke="var(--brand-accent)" strokeWidth="1.7" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>
                                    </div>
                                    <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'green', display: 'inline-block' }} />
                                        Live
                                    </span>
                                </div>
                                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, lineHeight: 1.35 }}>{quiz.title}</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                        {quiz.duration} minutes
                                    </span>
                                    {ti && <span style={{ fontSize: 12, color: ti.color, fontWeight: 500 }}>📅 {ti.text}</span>}
                                </div>
                                <div style={{ marginTop: 14, padding: '7px 12px', borderRadius: 10, background: 'var(--brand-accent-glow)', textAlign: 'center', fontSize: 12, color: 'var(--brand-accent)', fontWeight: 600 }}>
                                    🔑 Enter code to join
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
