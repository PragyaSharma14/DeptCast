import React from 'react';
import { Route, Switch, useLocation, Link } from 'wouter';
import { Company } from './Company';
import { Team } from './Team';
import { Building2, Users, CreditCard } from 'lucide-react';
import { cn } from '../../lib/utils';

export const SettingsLayout = () => {
    const [location] = useLocation();

    const navItems = [
        { name: 'Company Profile', path: '/settings/company', icon: Building2 },
        { name: 'Team Members', path: '/settings/team', icon: Users },
        { name: 'Billing', path: '/settings/billing', icon: CreditCard },
    ];

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-heading font-bold text-white mb-8">Workspace Settings</h1>
            
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="md:w-64 flex-shrink-0">
                    <nav className="flex flex-col gap-2">
                        {navItems.map((item) => {
                            const isActive = location === item.path;
                            return (
                                <Link key={item.path} href={item.path}>
                                    <span className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-sm",
                                        isActive 
                                            ? "bg-brand/20 text-brand border border-brand/30 shadow-[0_0_20px_rgba(170,59,255,0.1)]" 
                                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                                    )}>
                                        <item.icon size={18} />
                                        {item.name}
                                    </span>
                                </Link>
                            )
                        })}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 bg-dark-glass border border-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
                    <Switch>
                        <Route path="/settings/company" component={Company} />
                        <Route path="/settings/team" component={Team} />
                        <Route path="/settings/billing">
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Billing & Subscription</h2>
                                <p className="text-gray-400">Manage your Stripe subscription here. (Integration placeholder)</p>
                            </div>
                        </Route>
                        <Route>
                            <div className="p-10 text-center text-gray-500">Select a settings category</div>
                        </Route>
                    </Switch>
                </main>
            </div>
        </div>
    );
};
