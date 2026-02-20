"use client";

import { Form, Input, Button, Checkbox, message } from "antd";
import {
  UserOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  LoginOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authenticateUser, setUserSession } from "@/lib/auth";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = (values) => {
    setLoading(true);
    console.log("Attempting login with:", values.username);

    // Simulate login delay
    setTimeout(() => {
      const result = authenticateUser(values.username, values.password);
      
      if (result.success) {
        // Save user session
        setUserSession(result.user);
        
        message.success("Login successful!");
        
        // Redirect based on role
        if (result.user.role === 'admin') {
          router.push("/admin");
        } else {
          router.push("/find-bins");
        }
      } else {
        message.error(result.error);
      }
      setLoading(false);
    }, 800);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
    message.error("Please check your input.");
  };

  return (
    <div className="bg-[#f6f8f6] dark:bg-[#0a0a0a] font-display min-h-screen flex flex-col">
      <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#102216]/60 backdrop-blur-[2px] z-10"></div>
          <div
            className="h-full w-full bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=2070&auto=format&fit=crop')",
            }}
          ></div>
        </div>

        <div className="relative z-20 flex h-full grow flex-col justify-center items-center p-4">
          {/* Login Card */}
          <div className="w-full max-w-[480px] bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden border border-[#cfe7d7] dark:border-[#2a2a2a]">
            {/* Card Header with Gradient/Image */}
            <div
              className="relative h-32 bg-cover bg-center flex items-end p-8"
              style={{
                backgroundImage:
                  "linear-gradient(0deg, rgba(16, 34, 22, 0.9) 0%, rgba(16, 34, 22, 0.4) 100%), url('https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=2574&auto=format&fit=crop')",
              }}
            >
              <div className="w-full">
                <div className="flex items-center gap-3 mb-1">
                  <EnvironmentOutlined
                    style={{ fontSize: "32px", color: "#13ec5b" }}
                  />
                  <h1 className="text-white text-3xl font-bold tracking-tight">
                    TrashTrack
                  </h1>
                </div>
                <p className="text-gray-200 text-sm font-medium opacity-90 pl-1">
                  Join the green revolution
                </p>
              </div>
            </div>

            <div className="p-8 flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-[#0d1b12] dark:text-white">
                  Welcome back
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Please enter your details to sign in.
                </p>
              </div>

              <Form
                name="login"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                autoComplete="off"
                layout="vertical"
                size="large"
                className="flex flex-col gap-2"
              >
                {/* Username Field */}
                <Form.Item
                  name="username"
                  label={
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      Username
                    </span>
                  }
                  rules={[
                    { required: true, message: "Please input your username!" },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined className="text-slate-400" />}
                    placeholder="Enter your username"
                    className="h-12 rounded-lg"
                  />
                </Form.Item>

                {/* Password Field */}
                <Form.Item
                  name="password"
                  label={
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      Password
                    </span>
                  }
                  rules={[
                    { required: true, message: "Please input your password!" },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-slate-400" />}
                    placeholder="Enter your password"
                    className="h-12 rounded-lg"
                    iconRender={(visible) =>
                      visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                    }
                  />
                </Form.Item>

                {/* Actions Row */}
                <div className="flex items-center justify-between mb-4">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox className="text-slate-600 dark:text-slate-400">
                      Remember me
                    </Checkbox>
                  </Form.Item>
                </div>

                {/* Submit Button */}
                <Form.Item className="mb-0">
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                    className="h-12 bg-[#13ec5b] border-none hover:bg-[#0ea641] text-slate-900 font-bold text-lg shadow-lg shadow-emerald-500/20 rounded-xl flex items-center justify-center gap-2"
                  >
                    <span>Sign In</span>
                    {!loading && <LoginOutlined />}
                  </Button>
                </Form.Item>
              </Form>

              {/* Demo Credentials Notice */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-2">Demo Credentials:</p>
                <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                  <p><strong>Admin:</strong> admin / admin123</p>
                  <p><strong>User:</strong> user / user123</p>
                  <p><strong>Demo:</strong> demo / demo123</p>
                </div>
              </div>
            </div>
          </div>

          {/* Page Footer */}
          <div className="mt-8 text-center animate-in fade-in duration-700 delay-300">
            <p className="text-sm text-white/80 font-medium">
              © 2026 TrashTrack. All rights reserved.
            </p>
            <div className="flex justify-center gap-6 mt-3 text-xs text-white/60">
              <a
                className="hover:text-[#13ec5b] transition-colors"
                href="/login"
              >
                Privacy Policy
              </a>
              <a
                className="hover:text-[#13ec5b] transition-colors"
                href="/login"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
