import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "https://localhost:7261/api/v1";

// ========== INTERFACES ==========
export interface ToolInfo {
  name: string;
  description: string;
  isPremium?: boolean;
  isFavorite?: boolean;
  isEnabled?: boolean;
  category?: string;
}

export interface MenuItem {
  title: string;
  children?: { title: string }[];
}

export interface AuthResponse {
  user: {
    username: string;
    role: number;
  };
}

export interface ToolMetadata {
  name: string;
  description: string;
  isPremium?: boolean;
  inputSchema: object;
  outputSchema: object;
}

// ========== TOOL APIs ==========

// 🛠 Lấy danh sách tool
export const getTools = async (): Promise<ToolInfo[]> => {
  const res = await axios.get(`${API_BASE}/tools`);
  return res.data;
};

// 📄 Lấy metadata của 1 tool
export const getToolMetadata = async (toolId: string): Promise<ToolMetadata> => {
  const res = await axios.get(`${API_BASE}/tools/${toolId}/metadata`);
  return res.data;
};

// 🧪 Gửi dữ liệu để xử lý
export const submitTool = async (toolId: string, data: any): Promise<any> => {
  const res = await axios.post(`${API_BASE}/tools/${toolId}`, data);
  return res.data;
};

// Toggle favorite
export const toggleFavoriteAPI = async (toolName: string): Promise<void> => {
  await axios.post(`${API_BASE}/favorites`, { toolName });
};
export const togglePremium = async (toolName: string): Promise<void> => {
  await axios.post(`${API_BASE}/admin/tools/toggle-premium`, { toolName });
};

// ✅ Toggle enable/disable tool
export const toggleEnabled = async (toolName: string): Promise<void> => {
  await axios.post(`${API_BASE}/admin/tools/toggle-enabled`, { toolName });
};

// ❌ Delete a tool
export const deleteTool = async (toolName: string): Promise<void> => {
  await axios.delete(`${API_BASE}/admin/tools/${toolName}`);
};
export const getAdminTools = async (): Promise<ToolInfo[]> => {
  const res = await axios.get(`${API_BASE}/admin/tools`);
  return res.data;
};



// ========== MENU ==========
export const getMenuItems = async (): Promise<MenuItem[]> => {
  const res = await axios.get(`${API_BASE}/menu`);
  return res.data;
};

// ========== AUTH ==========
export const loginUser = async (userName: string, password: string): Promise<AuthResponse> => {
  const res = await axios.post(`${API_BASE}/auth/login`, { userName, password });
  return res.data;
};

export const logoutUser = async (): Promise<void> => {
  await axios.post(`${API_BASE}/auth/logout`);
};

export const registerUser = async (userName: string, password: string): Promise<void> => {
  await axios.post(`${API_BASE}/auth/register`, { userName, password });
};

// ========== ADMIN ==========
export const getUsers = async (): Promise<{ userName: string; role: number }[]> => {
  const res = await axios.get(`${API_BASE}/users`);
  return res.data;
};

export const changeUserRole = async (userName: string, role: number): Promise<void> => {
  await axios.put(`${API_BASE}/users/role`, { userName, role });
};
// 🔼 Upload tool DLL (admin)
export const uploadToolDLL = async (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append("dll", file);

  await axios.post(`${API_BASE}/admin/tools/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

