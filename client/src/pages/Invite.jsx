import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { acceptInviteReq } from '../services/api';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader2 } from 'lucide-react';

export const Invite = () => {
    const [, setLocation] = useLocation();
    const { login, token, user } = useStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Parse query params manually since wouter doesn't have a clean hook for it
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const inviteToken = params.get('token');
    const email = params.get('email');

    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    useEffect(() => {
        if (!inviteToken || !email) {
            setError("Invalid invitation link. Missing token or email.");
        }
    }, [inviteToken, email]);

    const handleAccept = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await acceptInviteReq({ 
                token: inviteToken, 
                email, 
                password: token ? undefined : password, 
                name: token ? undefined : name 
            });
            login(data);
            setLocation('/');
            window.location.reload(); 
        } catch (err) {
            setError(err.response?.data?.error || "Failed to accept invitation");
        } finally {
            setLoading(false);
        }
    };

    if (error && (!inviteToken || !email)) {
        return <div className="min-h-screen bg-black flex items-center justify-center p-4 text-white">
            <div className="bg-gray-900 border border-red-500/50 p-8 rounded-2xl">
                <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
                <p>{error}</p>
            </div>
        </div>
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-brand/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] p-8 rounded-3xl relative z-10 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                        Join Workspace
                    </h1>
                    <p className="text-gray-400 text-sm mt-2">You've been invited to collaborate as {email}</p>
                </div>

                {error && <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">{error}</div>}

                <form onSubmit={handleAccept} className="space-y-4">
                    {!token && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-400 ml-1">Full Name</label>
                                <Input 
                                    placeholder="Jane Doe" 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    required
                                    className="bg-black/50"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-400 ml-1">Set Password</label>
                                <Input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    required
                                    className="bg-black/50"
                                />
                            </div>
                        </>
                    )}
                    
                    {token && user && user.email !== email && (
                         <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm rounded-xl">
                            Warning: You are currently logged in as {user.email}, but this invite is for {email}.
                         </div>
                    )}

                    <Button type="submit" className="w-full h-12 text-lg shadow-[0_0_20px_rgba(170,59,255,0.3)] hover:shadow-[0_0_30px_rgba(170,59,255,0.5)] transition-all bg-brand hover:opacity-90 flex justify-center items-center" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin mr-2" /> : 'Accept Invitation'}
                    </Button>
                </form>
            </div>
        </div>
    );
};
