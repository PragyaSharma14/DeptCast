import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL
});

api.interceptors.request.use((config) => {
    try {
        const rawStore = localStorage.getItem('video-gen-storage');
        if (rawStore) {
            const parsed = JSON.parse(rawStore);
            // Zustand persist stores data under 'state'
            const state = parsed.state || parsed; 
            
            if (state && state.token) {
                config.headers.Authorization = `Bearer ${state.token}`;
            }
            
            const orgId = state.activeOrg?.id || state.activeOrg?._id || state.user?.currentOrganizationId;
            if (orgId) {
                config.headers['x-organization-id'] = orgId;
            }
        }
    } catch(e) {
        console.warn("Auth Interceptor: Failed to retrieve session context", e);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const getProjects = () => api.get('/projects').then(res => res.data);
export const getProjectDetails = (id) => api.get(`/projects/${id}`).then(res => res.data);
export const getWizardBootstrap = () => api.get('/projects/bootstrap').then(res => res.data);
export const createProject = (data) => api.post('/projects', data).then(res => res.data);
export const generateBlueprint = (data) => api.post('/projects/generate-blueprint', data).then(res => res.data);
export const generateVideo = (projectId) => api.post(`/videos/project/${projectId}/generate`).then(res => res.data);
export const regenerateScene = (sceneId, promptOverride) => api.post(`/videos/scene/${sceneId}/regenerate`, { promptOverride }).then(res => res.data);

export const getDepartments = () => api.get('/departments').then(res => res.data);
export const getTemplatesByDepartment = (deptId) => api.get(`/departments/${deptId}/templates`).then(res => res.data);

export const getSectors = () => api.get('/sectors').then(res => res.data);
export const getDepartmentsBySector = (sectorId) => api.get(`/sectors/${sectorId}/departments`).then(res => res.data);

// Dashboard APIs
export const getDashboardStats = () => api.get('/dashboard/stats').then(res => res.data);
export const getDashboardSchedules = () => api.get('/dashboard/schedules').then(res => res.data);
export const createDashboardSchedule = (data) => api.post('/dashboard/schedules', data).then(res => res.data);

// Auth & Tenant APIs
export const login = (credentials) => api.post('/auth/login', credentials).then(res => res.data);
export const register = (credentials) => api.post('/auth/register', credentials).then(res => res.data);
export const getMyOrgs = () => api.get('/orgs').then(res => res.data);
export const getOrgDetails = (orgId) => api.get(`/orgs/${orgId}/details`).then(res => res.data);
export const updateOrg = (orgId, data) => api.patch(`/orgs/${orgId}`, data).then(res => res.data);
export const getOrgMembers = (orgId) => api.get(`/orgs/${orgId}/members`).then(res => res.data);
export const inviteUser = (orgId, data) => api.post(`/orgs/${orgId}/invites`, data).then(res => res.data);
export const updateMemberRole = (orgId, memberId, role) => api.patch(`/orgs/${orgId}/members/${memberId}`, { role }).then(res => res.data);
export const removeMember = (orgId, memberId) => api.delete(`/orgs/${orgId}/members/${memberId}`).then(res => res.data);
export const acceptInviteReq = (data) => api.post('/auth/accept-invite', data).then(res => res.data);

export const getMediaUrl = (path) => {
    if(!path) return null;
    if(path.startsWith('http')) return path;
    const base = API_URL.replace('/api', '');
    return `${base}${path}`;
};
