import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post("/register/", data),
  login: (data) => api.post("/login/", data),
  profile: () => api.get("/profile/"),
};

export const repoAPI = {
  list: (params) => api.get("/repositories/", { params }),
  detail: (id) => api.get(`/repositories/${id}/`),
  delete: (id) => api.delete(`/repositories/${id}/`),
  sync: (username) => api.post("/github/sync/", { username }),
  analytics: () => api.get("/repositories/analytics/"),
  score: () => api.get("/repositories/score/"),
  dashboard: () => api.get("/repositories/dashboard/"),
  health: (id) => api.get(`/repositories/${id}/health/`),
};

export const analysisAPI = {
  career: () => api.get("/analysis/career/"),
  repository: (id) => api.post(`/analysis/repository/${id}/`),
  readme: (repositoryId) => api.post("/analysis/readme/", { repository_id: repositoryId }),
  resume: (resumeText) => api.post("/analysis/resume/", { resume_text: resumeText }),
};

export const dashboardAPI = {
  unified: () => api.get("/dashboard/"),
};

export default api;
