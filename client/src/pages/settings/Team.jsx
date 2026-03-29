import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { getOrgMembers, inviteUser, removeMember, updateMemberRole } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loader2, Mail, Trash2, Shield, User as UserIcon } from 'lucide-react';

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

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-brand" /></div>;

    // Check my role in this org
    const myMembership = members.find(m => m.userId?._id === user?._id);
    const isAdmin = myMembership?.role === 'admin';

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Team Management</h2>
                <p className="text-gray-400 text-sm mt-1">Manage access control, roles, and invite new members.</p>
            </div>

            {isAdmin && (
                <div className="bg-black/30 p-5 rounded-xl border border-brand/20 shadow-[0_0_20px_rgba(170,59,255,0.05)]">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Mail size={16} className="text-brand"/> Invite New Member</h3>
                    <form onSubmit={handleInvite} className="flex gap-3">
                        <Input 
                            type="email" 
                            placeholder="Email address" 
                            value={inviteEmail} 
                            onChange={(e) => setInviteEmail(e.target.value)}
                            required
                            className="bg-black/50 flex-1 border-white/10"
                        />
                        <select 
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value)}
                            className="bg-gray-900 border border-white/10 text-white rounded-lg px-3 text-sm focus:border-brand outline-none"
                        >
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                            <option value="viewer">Viewer</option>
                        </select>
                        <Button type="submit" disabled={inviting}>
                            {inviting ? <Loader2 className="animate-spin h-4 w-4" /> : 'Send Invite'}
                        </Button>
                    </form>
                </div>
            )}

            <div className="border border-white/10 rounded-xl overflow-hidden bg-black/20">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-gray-400 border-b border-white/10">
                        <tr>
                            <th className="px-6 py-4 font-medium">User</th>
                            <th className="px-6 py-4 font-medium">Role</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {members.map(member => (
                            <tr key={member._id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-purple-500 flex items-center justify-center text-xs font-bold shadow-lg">
                                            {member.userId?.name?.substring(0,2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white flex items-center gap-2">
                                                {member.userId?.name}
                                                {user?._id === member.userId?._id && <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-gray-300">You</span>}
                                            </div>
                                            <div className="text-xs text-gray-500">{member.userId?.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        {member.role === 'admin' ? <Shield size={14} className="text-brand"/> : <UserIcon size={14}/>}
                                        <span className="capitalize">{member.role}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {isAdmin && user?._id !== member.userId?._id && (
                                        <div className="flex items-center justify-end gap-2">
                                            <select 
                                                value={member.role}
                                                onChange={(e) => handleRoleChange(member._id, e.target.value)}
                                                className="bg-transparent border border-white/10 text-gray-300 text-xs rounded px-2 py-1 outline-none focus:border-brand"
                                            >
                                                <option value="admin">Admin</option>
                                                <option value="member">Member</option>
                                                <option value="viewer">Viewer</option>
                                            </select>
                                            <button 
                                                onClick={() => handleRemove(member._id)}
                                                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
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
    );
};
