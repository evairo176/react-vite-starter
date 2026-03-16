import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import authServices from "@/core/services/auth.service";
import { successCallback, errorCallback } from "@/core/utils/tanstack-callback";
import { useAuthStore } from "@/core/store/authStore";
// import { useAuthStore } from "@/core/store/authStore"; // kalau pakai zustand
export interface LoginPayload {
  email: string;
  password: string;
  code?: string; // kalau pakai MFA
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
    roleId: number;
    name?: string;
  };
  accessToken: string; // sesuai backend yang kamu kirim
  mfaRequired?: boolean;
}

// --- Schema Login ---
const LoginFormSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  rememberMe: z.boolean().optional(),
});

export type ILoginForm = z.infer<typeof LoginFormSchema>;

const useLogin = () => {
  const loginStore = useAuthStore((s) => s.login);
  const form = useForm<ILoginForm>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      // email: "semenjakpetang176@gmail.com",
      //    password: "Juara123",
      rememberMe: false,
    },
    mode: "onSubmit",
  });

  const loginRequest = async (payload: ILoginForm) => {
    // ambil userAgent dari browser (undefined di server/Node)
    const userAgent =
      typeof navigator !== "undefined" ? navigator.userAgent : undefined;

    // jika authServices.login menerima opsi headers
    const res = await authServices.login(
      {
        email: payload.email,
        password: payload.password,
        rememberMe: payload.rememberMe,
      },
      {
        headers: {
          // jangan set 'User-Agent' — set custom header
          ...(userAgent ? { "x-user-agent": userAgent } : {}),
        },
      },
    );

    return res;
  };

  const {
    mutate: mutateLogin,
    isPending: isPendingLogin,
    isSuccess: isSuccessLogin,
  } = useMutation({
    mutationFn: loginRequest,
    onSuccess: (response: any) => {
      const message = successCallback(response);
      toast.success(message);

      const data = response?.data?.data;

      // ⬅️ PENTING: simpan ke zustand
      loginStore({
        user: data.user,
        accessToken: data.accessToken,
      });

      // Kalau mau reset form:
      // form.reset();
    },
    onError: (error: any) => {
      const { message } = errorCallback(error);
      toast.error(message);
    },
  });

  const handleSubmit = (values: ILoginForm) => {
    mutateLogin(values);
  };

  return {
    form,
    handleSubmit,
    isPendingLogin,
    isSuccessLogin,
  };
};

export default useLogin;
