import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "https://localhost:7261/api/v1";

// ========== INTERFACES ==========

export interface ToolInfo {
  id: number; 
  name: string;
  description: string;
  isPremium?: boolean;
  isFavorite?: boolean;
  isEnabled?: boolean;
  category?: string;
}

export interface MenuItem {
  title: string;
  children?: { title: string; id: number }[]; // 
}

export interface AuthResponse {
  user: {
    username: string;
    role: number;
  };
  status: number;
  message: string;
}

export interface ToolMetadata {
  name: string;
  description: string;
  isPremium?: boolean;
  inputSchema: object;
  outputSchema: object;
}

// ========== TOOL APIs ==========

export const getTools = async (searchQuery = ""): Promise<{
  status: number;
  message: string;
  data: ToolInfo[];
}> => {
  const res = await axios.get(`${API_BASE}/tools`, {
    params: { search: searchQuery }
  });
  return res.data;
};


export const getToolMetadata = async (
  toolId: number
): Promise<{ status: number; message: string; data: ToolMetadata }> => {
  const res = await axios.get(`${API_BASE}/tools/${toolId}/metadata`);
  return res.data;
};

export const submitTool = async (
  toolId: number,
  data: any
): Promise<{ status: number; message: string; data: any }> => {
  const res = await axios.post(`${API_BASE}/tools/${toolId}`, data);
  return res.data;
};

export const toggleFavoriteAPI = async (
  toolId: number
): Promise<{ status: number; message: string }> => {
  const res = await axios.post(`${API_BASE}/favorites`, { toolId });
  return res.data;
};

export const togglePremium = async (
  toolId: number
): Promise<{ status: number; message: string }> => {
  const res = await axios.post(`${API_BASE}/admin/tools/toggle-premium`, { toolId });
  return res.data;
};

export const toggleEnabled = async (
  toolId: number
): Promise<{ status: number; message: string }> => {
  const res = await axios.post(`${API_BASE}/admin/tools/toggle-enabled`, { toolId });
  return res.data;
};

export const deleteTool = async (
  toolId: number
): Promise<{ status: number; message: string }> => {
  const res = await axios.delete(`${API_BASE}/admin/tools/${toolId}`);
  return res.data;
};

export const getAdminTools = async (): Promise<{
  status: number;
  message: string;
  data: ToolInfo[];
}> => {
  const res = await axios.get(`${API_BASE}/admin/tools`);
  return res.data;
};

// ========== MENU ==========

export const getMenuItems = async (): Promise<{
  status: number;
  message: string;
  data: MenuItem[];
}> => {
  const res = await axios.get(`${API_BASE}/menu`);
  return res.data;
};

// ========== AUTH ==========

export const loginUser = async (
  userName: string,
  password: string
): Promise<AuthResponse> => {
  const res = await axios.post(`${API_BASE}/auth/login`, { userName, password });
  return res.data;
};

export const logoutUser = async (): Promise<{ status: number; message: string }> => {
  const res = await axios.post(`${API_BASE}/auth/logout`);
  return res.data;
};

export const registerUser = async (
  userName: string,
  password: string
): Promise<{ status: number; message: string }> => {
  const res = await axios.post(`${API_BASE}/auth/register`, { userName, password });
  return res.data;
};

// ========== ADMIN ==========

export const getUsers = async (): Promise<{
  status: number;
  message: string;
  data: { userName: string; role: number }[];
}> => {
  const res = await axios.get(`${API_BASE}/users`);
  return res.data;
};

export const changeUserRole = async (
  userName: string,
  role: number
): Promise<{ status: number; message: string }> => {
  const res = await axios.put(`${API_BASE}/users/role`, { userName, role });
  return res.data;
};

export const uploadToolDLL = async (
  file: File
): Promise<{ status: number; message: string }> => {
  const formData = new FormData();
  formData.append("dll", file);

  const res = await axios.post(`${API_BASE}/admin/tools/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const requestUpgradeAPI = async (
  userName: string
): Promise<{ status: number; message: string }> => {
  const res = await axios.post(`${API_BASE}/users/request-upgrade`, { userName });
  return res.data;
};
