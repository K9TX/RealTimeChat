import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const authService = {
  register: async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register/`, userData);
    return response.data;
  },

  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login/`, {
      email,
      password,
    });
    if (response.data.access) {
      localStorage.setItem("token", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },

  resetPassword: async (email) => {
    const response = await axios.post(
      `${API_URL}/auth/password-reset/request/`,
      { email }
    );
    return response.data;
  },

  verifyOTP: async (data) => {
    const response = await axios.post(
      `${API_URL}/auth/password-reset/verify/`,
      data
    );
    return response.data;
  },

  changePassword: async (oldPassword, newPassword) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/auth/password/change/`,
      { old_password: oldPassword, new_password: newPassword },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  // Email verification methods
  sendVerificationEmail: async (email) => {
    const response = await axios.post(`${API_URL}/auth/send-verification/`, {
      email,
    });
    return response.data;
  },

  verifyEmail: async (email, otp) => {
    const response = await axios.post(`${API_URL}/auth/verify-email/`, {
      email,
      otp,
    });
    return response.data;
  },

  // Google login method
  googleLogin: async (credentialToken) => {
    try {
      const response = await axios.post(`${API_URL}/auth/google-login/`, {
        access_token: credentialToken,
      });

      if (response.data.access) {
        localStorage.setItem("token", response.data.access);
        localStorage.setItem("refreshToken", response.data.refresh);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateUsername: async (username) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/auth/profile/update-username/`,
      { username },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Update user data in localStorage
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Axios interceptor for handling token refresh
  setupAxiosInterceptors: () => {
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem("refreshToken");
            const response = await axios.post(
              `${API_URL}/auth/token/refresh/`,
              {
                refresh: refreshToken,
              }
            );
            localStorage.setItem("token", response.data.access);
            return axios(originalRequest);
          } catch (err) {
            authService.logout();
            return Promise.reject(err);
          }
        }
        return Promise.reject(error);
      }
    );
  },
};

export default authService;
