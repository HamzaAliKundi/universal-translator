/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function signUp(
  email: string,
  password: string,
  username: string
) {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/signup`, {
      email,
      password,

      username,
    });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Failed to sign up";
    throw new Error(errorMessage);
  }
}

export async function signIn(email: string, password: string) {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Failed to sign in";
    throw new Error(errorMessage);
  }
}

export async function checkUsername(username: string) {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/auth/check-username?username=${username}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error("Failed to check username");
  }
}

export async function resendVerification(email: string) {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/auth/resend-verification?email=${email}`
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Failed to resend verification email";
    throw new Error(errorMessage);
  }
}

export async function getUser(token: string): Promise<any> {
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/get-user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data; // Return the user data
  } catch (error: any) {
    if (error.response) {
      // Backend error response
      throw new Error(
        error.response.data.message || "Failed to fetch user details"
      );
    }
    // Network or other error
    throw new Error("An error occurred while fetching user details");
  }
}

const api = axios.create({
  baseURL: BASE_URL,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export async function hasPaid() {
  try {
    const response = await api.get("/api/auth/has-paid");
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getDocuments(page: number, limit: number) {
  try {
    const response = await api.get("/api/documents", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
}
export async function getDocument(id: string) {
  try {
    const response = await api.get(`/api/documents/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
}

export async function deleteDocument(id: string) {
  try {
    await api.delete(`/api/documents/${id}`);
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
}

export async function signOut(token: string): Promise<void> {
  const response = await fetch("/api/auth/signout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to sign out");
  }
}

export async function saveDocument(docData: any) {
  try {
    const response = await api.post("/api/documents", docData);
    return response.data;
  } catch (error) {
    console.error("Error saving document:", error);
    throw error;
  }
}

export async function getDocumentByHash(textHash: string) {
  try {
    const response = await api.get(`/hash/${textHash}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null; // Document not found
    }
    console.error("Error fetching document by hash:", error);
    throw error;
  }
}
