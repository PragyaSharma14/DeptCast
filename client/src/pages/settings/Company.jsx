import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { getMyOrgs, updateOrg } from '../../services/api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Loader2, Save } from 'lucide-react';

export const Company = () => {
    const { activeOrg, setActiveOrg } = useStore();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchOrg = async () => {
            try {
                const orgs = await getMyOrgs();
                if (orgs.length > 0) {
                    const current = orgs.find(o => o._id === activeOrg?._id) || orgs[0];
                    setName(current.name);
                    setActiveOrg(current);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrg();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updatedProfile = await updateOrg(activeOrg._id, { name });
            setActiveOrg(updatedProfile);
            alert("Settings saved successfully!");
        } catch (err) {
            alert(err.response?.data?.error || "Error saving workspace settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-brand" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Company Profile</h2>
                <p className="text-gray-400 text-sm mt-1">Manage your workspace identity and core settings.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6 max-w-lg">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Workspace Name</label>
                    <Input 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="bg-black/50"
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Company Logo</label>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gray-800 border border-white/10 flex items-center justify-center font-bold text-xl uppercase">
                            {name ? name.substring(0, 2) : 'WS'}
                        </div>
                        <Button type="button" variant="secondary" size="sm">Upload Logo</Button>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                    <Button type="submit" disabled={saving} className="bg-brand text-white">
                        {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
};
