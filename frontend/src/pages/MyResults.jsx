import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BANDS = [
    { pct: 80, label: 'Excellent', color: '#1a7a3a', bg: 'rgba(48,209,88,0.1)', emoji: '⭐' },
    { pct: 60, label: 'Good',      color: '#6c63ff', bg: 'rgba(108,99,255,0.1)', emoji: '👍' },
    { pct: 40, label: 'Average',   color: '#a05800', bg: 'rgba(255,159,10,0.1)', emoji: '📝' },
    { pct:  0, label: 'Needs Work',color: '#c0000a', bg: 'rgba(255,59,48,0.1)',  emoji: '💪' },
];

const getBand = (score, total = 10) => {
    const pct = total ? (score / total) * 100 : 0;
    return BANDS.find(b => pct >= b.pct) || BANDS[BANDS.length-1];
};

const MyResults = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const nav = useNavigate();

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/api/quiz/my-results`, { headers: { Authorization: `Bearer ${user.token}` } })
            .then(r => setResults(r.data))
            .catch(console.error).finally(() => setLoading(false));
    }, [user.token]);

    if (loading) return (
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 88, borderRadius: 20 }} />)}
        </div>
    );

    return (
        <div className="page-in" style={{ maxWidth: 680, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 26 }}>
                <div>
                    <h1 style={{ fontSize: 'clamp(20px,4vw,26px)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>📋 My Results</h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Your quiz performance history</p>
                </div>
                <button className="btn btn-ghost btn-sm btn-pill" onClick={() => nav('/')}>← Dashboard</button>
            </div>

            {results.length === 0 ? (
                <div className="card" style={{ padding: '52px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: 44, marginBottom: 14 }}>🎯</div>
                    <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>No results yet</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 24 }}>You haven't completed any quizzes with published results yet.</p>
                    <button className="btn btn-primary" style={{ padding: '12px 28px' }} onClick={() => nav('/')}>Take a Quiz →</button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {results.map((r, i) => {
                        const band = getBand(r.score);
                        return (
                            <div key={r._id || i} className="card card-hover" style={{ padding: 'clamp(16px,4vw,22px)', display: 'flex', alignItems: 'center', gap: 18, animation: `pageIn 0.4s ease ${i * 0.05}s both` }}>
                                {/* Score badge */}
                                <div style={{ flexShrink: 0, width: 60, height: 60, borderRadius: '50%', background: band.bg, border: `2px solid ${band.color}30`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ fontSize: 18, fontWeight: 900, color: band.color, lineHeight: 1 }}>{r.score}</div>
                                    <div style={{ fontSize: 9, fontWeight: 600, color: band.color, letterSpacing: '0.05em', textTransform: 'uppercase' }}>pts</div>
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {r.quizId?.title || 'Unknown Quiz'}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: band.bg, color: band.color }}>
                                            {band.emoji} {band.label}
                                        </span>
                                        <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                                            {new Date(r.submittedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyResults;
