// src/core/libs/api.ts
import axios from "axios";
import { useAuthStore } from "../store/authStore"; // sesuaikan path jika perlu

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";
const REFRESH_URL = "/auth/refresh-token"; // endpoint refresh token

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // agar cookie refresh-token dikirim
});

// instance tanpa interceptor untuk memanggil refresh
const refreshClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// helper fallback baca persisted accessToken (legacy)
function getPersistedAccessToken() {
  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

/* ---------------- request interceptor ---------------- */
api.interceptors.request.use(
  (config) => {
    config.headers = config.headers ?? {};
    let token = useAuthStore.getState()?.accessToken ?? null;
    if (!token) token = getPersistedAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (err) => Promise.reject(err)
);

/* ----------------- refresh queue handling ----------------- */
let isRefreshing = false;
type QueueItem = {
  resolve: (value?: any) => void;
  reject: (err: any) => void;
};
let failedQueue: QueueItem[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token);
    }
  });
  failedQueue = [];
};

/* --------------- response interceptor (with refresh) --------------- */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // jika tidak ada response (network error), langsung reject

    // harus di sesuaikan dengan error di api refresh token dan jwt error nya
    const AUTO_LOGOUT_ERROR = [
      "Session expired or invalid",
      "Session expired",
      "Session has been revoked",
      "Session does not exist",
    ];

    if (AUTO_LOGOUT_ERROR.includes(error.response.data?.message)) {
      useAuthStore.getState()?.logout?.();
      return Promise.reject(error);
    }

    if (!error || !error.response) return Promise.reject(error);

    const status = error.response.status;

    // only handle 401 here
    if (status !== 401) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // safety: kalau tidak ada originalRequest -> reject
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // jika request ini adalah refresh request sendiri -> artinya refresh gagal
    if (originalRequest.url && originalRequest.url.includes(REFRESH_URL)) {
      try {
        useAuthStore.getState()?.logout?.();
      } catch (e) {
        // ignore
      }
      return Promise.reject(error);
    }

    // prevent infinite loop: jika sudah ditandai _retry, jangan coba lagi
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // kalau sudah ada proses refresh berjalan -> antrikan request ini
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            try {
              originalRequest.headers = originalRequest.headers ?? {};
              if (token) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(api(originalRequest));
            } catch (err) {
              reject(err);
            }
          },
          reject,
        });
      });
    }

    // mulai proses refresh
    isRefreshing = true;
    try {
      const res = await refreshClient.post(REFRESH_URL);

      const newAccessToken = res?.data?.data?.accessToken ?? null;
      const returnedUser = res?.data?.data?.user ?? null;

      if (!newAccessToken) {
        // kalau refresh tidak mengembalikan token -> logout & tolak semua antrian
        try {
          useAuthStore.getState()?.logout?.();
        } catch (e) {
          // ignore
        }
        processQueue(new Error("No new access token from refresh"), null);
        return Promise.reject(error);
      }

      // update store sesuai store-mu yang hanya punya login & logout
      const store = useAuthStore.getState();
      try {
        if (returnedUser && store?.login) {
          // backend returned user object
          store.login({ user: returnedUser, accessToken: newAccessToken });
        } else if (store?.user) {
          // backend didn't return user, but store already has user -> call login to update token
          store.login({ user: store.user, accessToken: newAccessToken });
        } else {
          // fallback: directly set state (avoid changing store signature)
          // use 'as any' to avoid TS error on setState typing
          (useAuthStore as any).setState({
            accessToken: newAccessToken,
            isAuthenticated: true,
          });
        }
      } catch (e) {
        // fallback if login fails: setState
        (useAuthStore as any).setState({
          accessToken: newAccessToken,
          isAuthenticated: true,
        });
      }

      // lanjutkan antrian dengan token baru
      processQueue(null, newAccessToken);

      // set header pada originalRequest lalu retry
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (err) {
      // refresh request itself gagal (network or 4xx/5xx)
      try {
        useAuthStore.getState()?.logout?.();
      } catch (e) {
        // ignore
      }
      processQueue(err, null);
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
