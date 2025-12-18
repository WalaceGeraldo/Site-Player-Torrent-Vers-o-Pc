import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TorrentPlayer = ({ initialMagnetLink = '' }) => {
    const [magnetLink, setMagnetLink] = useState(initialMagnetLink);
    const [showMagnet, setShowMagnet] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');
    const [status, setStatus] = useState('Ocioso');
    const [error, setError] = useState(null);
    const videoRef = useRef(null);
    const navigate = useNavigate();

    // Auto-start if initialMagnetLink is provided
    useEffect(() => {
        if (initialMagnetLink) {
            handleStartStream();
        }
    }, [initialMagnetLink]);

    const handleStartStream = async () => {
        if (!magnetLink) return;

        setStatus('Iniciando stream...');
        setError(null);

        try {
            const url = await window.electronAPI.startStream(magnetLink.trim());
            setVideoUrl(url);
            setStatus('Transmitindo');
        } catch (err) {
            console.error(err);
            setError('Falha ao iniciar stream: ' + err);
            setStatus('Erro');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
            color: 'white',
            fontFamily: "'Inter', sans-serif",
            padding: '20px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '800px',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '40px',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                border: '1px solid rgba(255, 255, 255, 0.18)'
            }}>
                <h1 style={{
                    textAlign: 'center',
                    marginBottom: '30px',
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Player de Torrent
                </h1>

                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                    <input
                        type="text"
                        value={magnetLink}
                        onChange={(e) => setMagnetLink(e.target.value)}
                        placeholder="Cole o Link Magnet aqui..."
                        style={{
                            flex: 1,
                            padding: '15px 20px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            background: 'rgba(0, 0, 0, 0.2)',
                            color: 'white',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.4)'}
                        onBlur={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.2)'}
                    />
                    <button
                        onClick={handleStartStream}
                        disabled={status === 'Iniciando stream...'}
                        style={{
                            padding: '15px 30px',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(0, 242, 254, 0.3)',
                            transition: 'transform 0.2s ease',
                            opacity: status === 'Iniciando stream...' ? 0.7 : 1
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    >
                        {status === 'Iniciando stream...' ? 'Carregando...' : 'Reproduzir'}
                    </button>
                </div>

                {status !== 'Ocioso' && (
                    <div style={{
                        marginTop: '15px',
                        marginBottom: '20px',
                        textAlign: 'center',
                        color: status === 'Erro' ? '#ff6b6b' : '#a8a8b3',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: status === 'Transmitindo' ? '#51cf66' : (status === 'Erro' ? '#ff6b6b' : '#fcc419'),
                            boxShadow: `0 0 10px ${status === 'Transmitindo' ? '#51cf66' : (status === 'Erro' ? '#ff6b6b' : '#fcc419')}`
                        }}></div>
                        <span>Status: {status}</span>
                    </div>
                )}

                {error && <p style={{ color: '#ff6b6b', textAlign: 'center', marginTop: '10px' }}>{error}</p>}

                {videoUrl ? (
                    <div
                        style={{
                            marginTop: '20px',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                            background: '#000',
                            position: 'relative',
                            aspectRatio: '16/9',
                            animation: 'fadeIn 0.5s ease-in-out'
                        }}
                        onClick={() => setShowMagnet(!showMagnet)}
                    >
                        <video
                            ref={videoRef}
                            controls
                            autoPlay
                            style={{ width: '100%', height: '100%', display: 'block' }}
                            src={videoUrl}
                        >
                            Seu navegador não suporta a tag de vídeo.
                        </video>
                        {showMagnet && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    color: 'white',
                                    zIndex: 20,
                                    padding: '20px'
                                }}
                            >
                                <h3 style={{ marginBottom: '15px' }}>Magnet Link</h3>
                                <div
                                    style={{
                                        background: '#333',
                                        padding: '15px',
                                        borderRadius: '8px',
                                        marginBottom: '20px',
                                        wordBreak: 'break-all',
                                        maxHeight: '150px',
                                        overflowY: 'auto',
                                        width: '80%',
                                        textAlign: 'center',
                                        fontSize: '0.9rem',
                                        cursor: 'text'
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {magnetLink}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMagnet(false);
                                    }}
                                    style={{
                                        padding: '8px 16px',
                                        background: '#444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Fechar
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{
                        marginTop: '20px',
                        padding: '60px',
                        textAlign: 'center',
                        border: '2px dashed rgba(255, 255, 255, 0.2)',
                        borderRadius: '16px',
                        color: 'rgba(255, 255, 255, 0.5)',
                        background: 'rgba(0,0,0,0.1)'
                    }}>
                        <p>O vídeo aparecerá aqui após iniciar o stream.</p>
                    </div>
                )}
            </div>
            <style>
                {`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                `}
            </style>
        </div>
    );
};

export default TorrentPlayer;
