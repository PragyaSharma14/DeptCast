import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL
});

// Add interceptor to inject Auth and Tenant context
api.interceptors.request.use((config) => {
    // Read directly from zustand persisted storage
    try {
        const persistData = localStorage.getItem('video-gen-storage');
        if (persistData) {
            const state = JSON.parse(persistData).state;
            if (state?.token) {
                config.headers.Authorization = `Bearer ${state.token}`;
            }
            if (state?.activeOrg?._id || state?.user?.currentOrganizationId) {
                config.headers['x-organization-id'] = state.activeOrg?._id || state.user?.currentOrganizationId;
            }
        }
    } catch(e) {
        console.error("Failed to parse auth state for request interceptor", e);
    }
    return config;
});

export const getProjects = () => api.get('/projects').then(res => res.data);
export const getProjectDetails = (id) => api.get(`/projects/${id}`).then(res => res.data);
export const createProject = (data) => api.post('/projects', data).then(res => res.data);
export const generateVideo = (projectId) => api.post(`/videos/project/${projectId}/generate`).then(res => res.data);
export const regenerateScene = (sceneId, promptOverride) => api.post(`/videos/scene/${sceneId}/regenerate`, { promptOverride }).then(res => res.data);

// Auth & Tenant APIs
export const login = (credentials) => api.post('/auth/login', credentials).then(res => res.data);
export const register = (credentials) => api.post('/auth/register', credentials).then(res => res.data);
export const getMyOrgs = () => api.get('/orgs').then(res => res.data);
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
