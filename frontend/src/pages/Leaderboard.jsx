import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MEDALS = ['🥇','🥈','🥉'];

const Leaderboard = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [users, setUsers] = useState([]);
    const [loadingQ, setLoadingQ] = useState(true);
    const [loadingL, setLoadingL] = useState(false);
    const { user } = useAuth();
    const nav = useNavigate();

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/api/quiz/leaderboards`, { headers: { Authorization: `Bearer ${user.token}` } })
            .then(r => { setQuizzes(r.data); if (r.data.length > 0) setSelectedQuiz(r.data[0]._id); })
            .catch(console.error).finally(() => setLoadingQ(false));
    }, [user.token]);

    useEffect(() => {
        if (!selectedQuiz) return;
        setLoadingL(true);
        axios.get(`${import.meta.env.VITE_API_URL}/api/quiz/leaderboard/${selectedQuiz}`, { headers: { Authorization: `Bearer ${user.token}` } })
            .then(r => setUsers(r.data))
            .catch(() => setUsers([])).finally(() => setLoadingL(false));
    }, [selectedQuiz, user.token]);

    const myRank = users.findIndex(u => u._id === user._id) + 1;
    const maxScore = users[0]?.score || 1;

    if (loadingQ) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50dvh' }}>
            <div className="brand-logo" style={{ fontSize: 20 }}>Loading…</div>
        </div>
    );

    return (
        <div className="page-in" style={{ maxWidth: 680, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 26 }}>
                <div>
                    <h1 style={{ fontSize: 'clamp(20px,4vw,26px)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>🏆 Leaderboard</h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>SVHEC Quiz Portal Rankings</p>
                </div>
                <button className="btn btn-ghost btn-sm btn-pill" onClick={() => nav('/')}>← Dashboard</button>
            </div>

            {quizzes.length === 0 ? (
                <div className="card" style={{ padding: '52px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: 44, marginBottom: 16 }}>📊</div>
                    <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>No results published</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>The admin hasn't published any results yet. Check back soon!</p>
                </div>
            ) : (
                <>
                    {/* Quiz tabs */}
                    {quizzes.length > 1 && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                            {quizzes.map(q => (
                                <button key={q._id} onClick={() => setSelectedQuiz(q._id)} className={`btn btn-sm btn-pill ${selectedQuiz === q._id ? 'btn-primary' : 'btn-ghost'}`}>
                                    {q.title}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* My rank */}
                    {myRank > 0 && (
                        <div style={{ padding: '14px 20px', marginBottom: 18, borderRadius: 16, background: 'rgba(108,99,255,0.06)', border: '1px solid rgba(108,99,255,0.14)', display: 'flex', alignItems: 'center', gap: 14 }}>
                            <span style={{ fontSize: 28 }}>{myRank <= 3 ? MEDALS[myRank-1] : '🎯'}</span>
                            <div>
                                <div style={{ fontWeight: 700, color: 'var(--brand-accent)', fontSize: 15 }}>Your Rank: #{myRank}</div>
                                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Score: {users[myRank-1]?.score} · {users.length} participants</div>
                            </div>
                        </div>
                    )}

                    <div className="card" style={{ overflow: 'hidden' }}>
                        {loadingL ? (
                            <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 14 }} />)}
                            </div>
                        ) : users.length === 0 ? (
                            <p style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-secondary)' }}>No rankings yet.</p>
                        ) : (
                            <>
                                {/* Podium */}
                                <div style={{ padding: '28px 20px 24px', background: 'linear-gradient(140deg,#1a1a2e,#16213e)', display: 'flex', justifyContent: 'center', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                    {[users[1], users[0], users[2]].filter(Boolean).map((u, vi) => {
                                        const rank = vi === 0 ? 2 : vi === 1 ? 1 : 3;
                                        return (
                                            <div key={u._id} style={{ textAlign: 'center', flex: '1 1 80px', maxWidth: 120 }}>
                                                <div style={{ fontSize: vi === 1 ? 34 : 24, marginBottom: 8 }}>{MEDALS[rank-1]}</div>
                                                <div style={{ width: vi === 1 ? 48 : 40, height: vi === 1 ? 48 : 40, borderRadius: '50%', margin: '0 auto 8px', background: 'linear-gradient(135deg,#6c63ff,#a29bfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: vi === 1 ? 18 : 14, boxShadow: u._id === user._id ? '0 0 0 3px rgba(255,255,255,0.35)' : 'none' }}>
                                                    {u.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700, fontSize: 13, marginBottom: 6, letterSpacing: '-0.01em' }}>
                                                    {u.name?.split(' ')[0]}
                                                    {u._id === user._id && <span style={{ color: '#a29bfe', marginLeft: 3 }}>·me</span>}
                                                </div>
                                                <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.14)', color: 'white', fontWeight: 800, fontSize: 13, padding: '2px 10px', borderRadius: 100 }}>{u.score}</div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Full list */}
                                <div>
                                    {users.map((u, i) => {
                                        const isMe = u._id === user._id;
                                        return (
                                            <div key={u._id} style={{ padding: '13px 20px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid var(--color-border)', background: isMe ? 'rgba(108,99,255,0.03)' : 'transparent', borderLeft: `3px solid ${isMe ? 'var(--brand-accent)' : 'transparent'}`, transition: 'background var(--dur-fast)' }}>
                                                <div style={{ width: 30, textAlign: 'center', fontSize: i < 3 ? 18 : 12, fontWeight: 700, color: i < 3 ? 'inherit' : 'var(--color-text-tertiary)', flexShrink: 0 }}>
                                                    {i < 3 ? MEDALS[i] : `#${i+1}`}
                                                </div>
                                                <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: isMe ? 'linear-gradient(135deg,#6c63ff,#a29bfe)' : 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isMe ? 'white' : 'var(--color-text-secondary)', fontWeight: 700, fontSize: 13 }}>
                                                    {u.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: isMe ? 700 : 500, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</span>
                                                        {isMe && <span className="badge badge-purple" style={{ fontSize: 10 }}>You</span>}
                                                    </div>
                                                    <div style={{ height: 3, background: '#eee', borderRadius: 100, marginTop: 5, overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', borderRadius: 100, background: isMe ? 'var(--brand-accent)' : '#ddd', width: `${(u.score / maxScore) * 100}%`, transition: 'width 0.9s ease 0.1s' }} />
                                                    </div>
                                                </div>
                                                <div style={{ fontWeight: 800, fontSize: 17, color: isMe ? 'var(--brand-accent)' : 'var(--color-text-primary)', flexShrink: 0 }}>{u.score}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Leaderboard;
