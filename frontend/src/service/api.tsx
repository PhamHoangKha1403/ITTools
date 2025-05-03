import axios, { AxiosResponse } from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || "https://localhost:7261/api/v1";

// ========== INTERFACES ==========

export interface ToolInfo {
  id: number;
  name: string;
  description: string;
  isPremium?: boolean;
  isEnabled?: boolean;
  group?: {
    id: number;
    name: string;
    description: string | null;
  }
}
export interface User {
  id: number;
  username: string;
  role: number;
}
export interface MenuItem {
  toolGroupId: number;
  toolGroupName: string;
  toolGroupDescription: string | null;
  tools: {
    id: number;
    name: string;
    isPremium?: boolean;
    isEnabled?: boolean;
  }[];
}

export interface PremiumRequest {
  id: number;
  userId: number;
  requestTimestamp: string;
  status: number;
  processedByUserId?: number | null;
  processedTimestamp?: string | null;
  adminNotes?: string | null;
  username?: string;
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

export const getTools = async (searchQuery = "") => {
  const res = await axios.get(`${API_BASE}/tools`, {
    params: { name: searchQuery },
    withCredentials: true 
  });
  return res;
};

export const getToolMetadata = async (
  toolId: number
) => {
  const res = await axios.get(`${API_BASE}/tools/${toolId}`, {
    withCredentials: true 
  });
  return res;
};

export const submitTool = async (
  toolId: number,
  data: any
) => {
  const res = await axios.post(`${API_BASE}/tools/${toolId}/execute`, data, {
    withCredentials: true 
  });
  return res;
};

export const togglePremium = async (
  toolId: number,
  isPremium: boolean
): Promise<{ status: number; message: string }> => {
  const res = await axios.patch(`${API_BASE}/tools/${toolId}/premium`, {
    isPremium,
  }, {
    withCredentials: true 
  });
  return res.data;
};

export const enableTool = async (
  toolId: number
): Promise<{ status: number; message: string }> => {
  // Note: PATCH might need data. Sending empty object {} as the second argument.
  const res = await axios.patch(`${API_BASE}/tools/${toolId}/enable`, {}, {
    withCredentials: true 
  });
  return res.data;
};

export const disableTool = async (
  toolId: number
): Promise<{ status: number; message: string }> => {
  // Note: PATCH might need data. Sending empty object {} as the second argument.
  const res = await axios.patch(`${API_BASE}/tools/${toolId}/disable`, {}, {
    withCredentials: true 
  });
  return res.data;
};

export const deleteTool = async (
  toolId: number
): Promise<{ status: number; message: string }> => {
  const res = await axios.delete(`${API_BASE}/tools/${toolId}`, {
    withCredentials: true 
  });
  return res.data;
};
// ========== FAVORITES ==========

export const getFavoriteTools = async () => {
  const res = await axios.get(`${API_BASE}/favorites`, { withCredentials: true });
  return res;
};
export const toggleFavoriteAPI = async (
  toolId: number
) => {
  const res = await axios.post(
    `${API_BASE}/favorites/${toolId}`,
    {},
    { withCredentials: true }
  );
  return res;
};
export const removeFavoriteAPI = async (toolId: number) => {
  const res = await axios.delete(`${API_BASE}/favorites/${toolId}`, {
    withCredentials: true
  });
  return res;
};

// ========== ADMIN (SPECIFIC) ==========

export const getAdminTools = async (): Promise<{
  status: number;
  message: string;
  data: ToolInfo[];
}> => {
  const res = await axios.get(`${API_BASE}/admin/tools`, {
    withCredentials: true 
  });
  return res.data;
};

// ========== MENU ==========

export const getMenuItems = async (): Promise<AxiosResponse<{
  status: number;
  message: string;
  data: MenuItem[];
}>> => {
  const res = await axios.get(`${API_BASE}/tool-groups/menu`, {
    withCredentials: true 
  });
  return res;
};

// ========== AUTH ==========

export const loginUser = async (
  userName: string,
  password: string
) => {
  const res = await axios.post(`${API_BASE}/auth/login`, { userName, password }, { withCredentials: true });
  return res;
};

export const logoutUser = async () => {
  const res = await axios.post(
    `${API_BASE}/auth/logout`,
    {},
    { withCredentials: true }
  );
  return res;
};

export const registerUser = async (
  userName: string,
  password: string
) => {
  const res = await axios.post(`${API_BASE}/auth/register`, { userName, password }, {
    withCredentials: true 
  });
  return res;
};

// ========== ADMIN (GENERAL & USER RELATED) ==========

export const getUsers = async () => {
  const res = await axios.get(`${API_BASE}/users`, { withCredentials: true });
  return res;
};

export const approvePremiumRequest = async (
  requestId: number,
  notes: string = ""
): Promise<AxiosResponse> => {
  const url = `${API_BASE}/users/premium-requests/${requestId}`;
  const requestBody = {
    status: 1, 
    notes: notes
  };
  const config = {
    headers: {
      'Content-Type': 'application/json-patch+json',
      'accept': '*/*',
    },
    withCredentials: true
  };
  const res = await axios.patch(url, requestBody, config);
  return res;
};

export const rejectPremiumRequest = async (
  requestId: number
): Promise<AxiosResponse> => {
  const url = `${API_BASE}/users/premium-requests/${requestId}`;
  const config = {
    headers: {
      'accept': '*/*',
    },
    withCredentials: true
  };
  const res = await axios.delete(url, config);
  return res;
};

export const uploadToolDLL = async (
  files: File[]
): Promise<{ status: number; message: string }> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  // Axios typically sets Content-Type automatically for FormData
  const res = await axios.post(`${API_BASE}/tools/upload`, formData, {
    withCredentials: true 
  });
  return res.data;
};

export const getPremiumRequests = async (): Promise<AxiosResponse<{ data: PremiumRequest[] }>> => {
  const url = `${API_BASE}/users/premium-requests`;
  const config = { withCredentials: true };
  return axios.get(url, config);
};

export const requestUpgradeAPI = async () => {
  const res = await axios.post(
    `${API_BASE}/users/premium-requests`,
    {},
    { withCredentials: true }
  );
  return res;
};