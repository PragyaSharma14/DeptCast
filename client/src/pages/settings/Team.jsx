import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { getOrgMembers, inviteUser, removeMember, updateMemberRole } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Loader2, Mail, Trash2, Shield, User as UserIcon, Users, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export const Team = () => {
    const { activeOrg, user } = useStore();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Invite state
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('member');
    const [inviting, setInviting] = useState(false);

    const fetchMembers = async () => {
        if (!activeOrg) return;
        try {
            const data = await getOrgMembers(activeOrg._id);
            setMembers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [activeOrg]);

    const handleInvite = async (e) => {
        e.preventDefault();
        setInviting(true);
        try {
            const res = await inviteUser(activeOrg._id, { email: inviteEmail, role: inviteRole });
            setInviteEmail('');
            
            if (res.sentViaEmail) {
                alert(`Success! Invitation sent to ${inviteEmail} via Resend.`);
            } else {
                alert("Invite logged! (Check server terminal for the magic link because real email sending is disabled or failed)");
            }
            fetchMembers();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to invite");
        } finally {
            setInviting(false);
        }
    };

    const handleRemove = async (memberId) => {
        if(!confirm("Are you sure you want to remove this user?")) return;
        try {
            await removeMember(activeOrg._id, memberId);
            setMembers(members.filter(m => m._id !== memberId));
        } catch (err) {
            alert("Failed to remove user");
        }
    };

    const handleRoleChange = async (memberId, newRole) => {
        try {
            await updateMemberRole(activeOrg._id, memberId, newRole);
            setMembers(members.map(m => m._id === memberId ? { ...m, role: newRole } : m));
        } catch (err) {
            alert("Failed to update role");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="animate-spin text-brand" size={40} />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading User Directory...</p>
        </div>
    );

    // Check my role in this org
    const myMembership = members.find(m => m.userId?._id === user?._id);
    const isAdmin = myMembership?.role === 'admin';

    return (
        <div className="max-w-5xl mx-auto pb-20 font-sans">
            <div className="sticky top-0 z-20 -mx-4 px-4 py-4 bg-slate-50/80 backdrop-blur-md border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between mb-8 shadow-sm gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                        <Users className="text-brand" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-heading font-bold text-slate-900">User Management</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Manage access control and team roles</p>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {isAdmin && (
                    <motion.section 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm"
                    >
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                                <Mail className="text-brand" size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-heading font-bold text-slate-900 leading-none">Invite New Member</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1.5">Add people to your workspace</p>
                            </div>
                        </div>

                        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <div className="flex-1 w-full">
                                <input 
                                    type="email" 
                                    placeholder="Enter collaborator's email address..." 
                                    value={inviteEmail} 
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand font-medium text-sm transition-all"
                                />
                            </div>
                            <select 
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value)}
                                className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand font-medium text-sm transition-all cursor-pointer outline-none appearance-none"
                            >
                                <option value="admin">Admin</option>
                                <option value="member">Member</option>
                                <option value="viewer">Viewer</option>
                            </select>
                            <Button 
                                type="submit" 
                                disabled={inviting || !inviteEmail}
                                className="w-full sm:w-auto rounded-xl px-8 h-11 text-sm font-bold bg-brand text-white shadow-md active:scale-95 btn-primary transition-all"
                            >
                                {inviting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                                {inviting ? 'Sending...' : 'Send Invite'}
                            </Button>
                        </form>
                    </motion.section>
                )}

                <motion.section 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                >
                    <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            <h3 className="font-bold text-sm text-slate-900">Active Directory</h3>
                            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest shadow-sm">
                                {members.length} Total Users
                            </span>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">User Profile</th>
                                        <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Access Role</th>
                                        <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px] text-right">Administrative Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {members.map(member => (
                                        <tr key={member._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand flex items-center justify-center text-sm font-bold shadow-sm border border-blue-100">
                                                        {member.userId?.name?.substring(0,2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 flex items-center gap-2">
                                                            {member.userId?.name}
                                                            {user?._id === member.userId?._id && (
                                                                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md text-slate-500 font-bold uppercase tracking-widest border border-slate-200">You</span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-slate-500 font-medium">{member.userId?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("p-1.5 rounded-lg", member.role === 'admin' ? "bg-purple-50 text-purple-600" : "bg-slate-100 text-slate-500")}>
                                                        {member.role === 'admin' ? <Shield size={14} /> : <UserIcon size={14}/>}
                                                    </div>
                                                    <span className="capitalize font-bold text-slate-700 text-xs">{member.role}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                {isAdmin && user?._id !== member.userId?._id && (
                                                    <div className="flex items-center justify-end gap-3">
                                                        <div className="relative group">
                                                            <select 
                                                                value={member.role}
                                                                onChange={(e) => handleRoleChange(member._id, e.target.value)}
                                                                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand cursor-pointer appearance-none pr-8 transition-colors hover:bg-slate-100"
                                                            >
                                                                <option value="admin">Admin</option>
                                                                <option value="member">Member</option>
                                                                <option value="viewer">Viewer</option>
                                                            </select>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleRemove(member._id)}
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                            title="Remove User"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.section>
            </div>
        </div>
    );
};
