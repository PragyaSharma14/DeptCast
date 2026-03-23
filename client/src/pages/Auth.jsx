import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useStore } from '../store/useStore';
import { login as loginApi, register as registerApi } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Loader2, Video as VideoIcon } from 'lucide-react';

export const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [, setLocation] = useLocation();
    const { setUser, setToken } = useStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = isLogin 
                ? await loginApi({ email, password })
                : await registerApi({ name, email, password });
            
            setToken(data.token);
            setUser({
                _id: data._id,
                name: data.name,
                email: data.email,
                currentOrganizationId: data.currentOrganizationId
            });
            
            // Redirect to dashboard
            setLocation('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="z-10 w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-brand to-purple-500 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(170,59,255,0.3)]">
                        <VideoIcon size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome to DeptCast</h1>
                    <p className="text-gray-400 mt-2 text-center">
                        {isLogin ? 'Sign in to access your enterprise workspace.' : 'Create an account to start generating videos.'}
                    </p>
                </div>

                <Card className="bg-dark-glass border-white/10 backdrop-blur-xl">
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            {!isLogin && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Full Name</label>
                                    <Input 
                                        type="text" 
                                        placeholder="John Doe" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="bg-black/50 border-white/10 focus:border-brand"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Email Address</label>
                                <Input 
                                    type="email" 
                                    placeholder="name@company.com" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-black/50 border-white/10 focus:border-brand"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Password</label>
                                <Input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-black/50 border-white/10 focus:border-brand"
                                />
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full mt-6 bg-brand hover:bg-brand/90 py-6"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                                {isLogin ? 'Sign In' : 'Create Account'}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm text-gray-400">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button 
                                type="button" 
                                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                className="text-brand hover:text-brand-light font-medium hover:underline"
                            >
                                {isLogin ? 'Sign up' : 'Sign in'}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
