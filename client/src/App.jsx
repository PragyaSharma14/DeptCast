import React, { useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { useStore } from './store/useStore';
import { getMyOrgs } from './services/api';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { Invite } from './pages/Invite';
import { NewVideoWizard } from './pages/videos/NewVideoWizard';
import { Produce } from './pages/videos/Produce';
import { Review } from './pages/videos/Review';
import { VideoDetail } from './pages/videos/VideoDetail';
import { SettingsLayout } from './pages/settings/SettingsLayout';

// HOC for Protected Routes
const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { token } = useStore();
  const [, setLocation] = useLocation();

  if (!token) {
    setLocation('/login');
    return null;
  }
  return <Component {...rest} />;
};

function App() {
  const { token, user, activeOrg, setActiveOrg } = useStore();
  
  useEffect(() => {
    const initOrg = async () => {
      if (token && !activeOrg) {
        try {
          const orgs = await getMyOrgs();
          if (orgs && orgs.length > 0) {
            // Pick currentOrganizationId if defined, otherwise first one
            const primary = orgs.find(o => o.id === user?.currentOrganizationId) || orgs[0];
            setActiveOrg(primary);
          }
        } catch (err) {
          console.error("Failed to auto-initialize organization", err);
        }
      }
    };
    initOrg();
  }, [token, activeOrg, user?.currentOrganizationId, setActiveOrg]);

  return (
    <Switch>
      <Route path="/login" component={Auth} />
      <Route path="/invite" component={Invite} />
      
      {/* Protected App Shell */}
      <Route path="/.*">
        {!token ? (
           <Auth /> // Immediate fallback rendering preventing flash
        ) : (
          <Layout>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/videos/new" component={NewVideoWizard} />
              <Route path="/videos/produce/:projectId" component={Produce} />
              <Route path="/videos/review/:projectId" component={Review} />
              <Route path="/videos/:projectId" component={VideoDetail} />
              <Route path="/settings/:path*" component={SettingsLayout} />
              
              {/* Fallback 404 */}
              <Route>
                <div className="flex flex-col items-center justify-center h-[50vh] text-center text-white">
                  <h1 className="text-4xl font-heading font-bold mb-4">404 - Not Found</h1>
                  <p className="text-gray-400">The page you are looking for doesn't exist.</p>
                </div>
              </Route>
            </Switch>
          </Layout>
        )}
      </Route>
    </Switch>
  );
}

export default App;
