'use client';

import { Form, Input, Button, Checkbox } from 'antd';
import { MailOutlined, LockOutlined, EyeInvisibleOutlined, EyeOutlined, LoginOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useState } from 'react';

export default function Home() {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const onFinish = (values) => {
    console.log('Success:', values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-text-main dark:text-text-main-dark min-h-screen flex flex-col">
      <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-background-dark/60 backdrop-blur-[2px] z-10"></div>
          <div
            className="h-full w-full bg-cover bg-center"
            style={{
              backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDgXZ_ROFim3mR_RfXDbJiKoNdiVqb06G1OmcIb8h0u1WhfXbIsQlwwO99YHT1bFACB4tmT8E9eqYI7EQNdJmY1OCRvlynvzbsfBqIw06Y2Rj1xpu5olfDz_VlZGE_MogkBE0fxRoCnsVy28E6nIsbIcOuGyGzkiueOw9Y6LvZbUo6D0fFw2ItofPmlXYUv3A0_Siv1OgrekaVlsq_q6g6janNzhlGhO9p68TT76gpCBdqbU5sXDK7LeTNU-_tKVX4m3-tRNV3YJnc')"
            }}
          ></div>
        </div>
        <div className="relative z-20 flex h-full grow flex-col justify-center items-center p-4">
          {/* Login Card */}
          <div className="w-full max-w-[480px] bg-surface-light dark:bg-surface-dark rounded-xl shadow-2xl overflow-hidden border border-border-light dark:border-border-dark">
            {/* Card Header with Gradient/Image */}
            <div
              className="relative h-32 bg-cover bg-center flex items-end p-6"
              style={{
                backgroundImage: "linear-gradient(0deg, rgba(16, 34, 22, 0.9) 0%, rgba(16, 34, 22, 0.4) 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuBqZRRJ686XBxiGqQreJSbyJC51dfnRCyV9sy5BjeKv5p7FE4GJLqDC7kGuJAFQVNnuInWx32hEv7H8m0MwDTimtq_U6gd6ViLIMexGzBldEDDJLfVzxQRxQULIumIbze-uR0bpOUTyTjbPygAJDs9ZOF5LiLNUknrHcetRrk0SNGxnkngG_3JqMBEyv02GFeglwTpUOrAmyOMHx96B77f5e5_UGBzbbubDTqq7eP_6TeXroZFNa_V3v_U9oftnfothemNEEpsKxIo')"
              }}
            >
              <div className="w-full">
                <div className="flex items-center gap-3 mb-1">
                  <EnvironmentOutlined style={{ fontSize: '36px', color: '#13ec5b' }} />
                  <h1 className="text-white text-2xl font-bold tracking-tight">Admin Portal</h1>
                </div>
                <p className="text-gray-200 text-sm font-medium opacity-90">Waste Management System</p>
              </div>
            </div>
            <div className="p-8 flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold text-text-main dark:text-text-main-dark">Welcome back</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Please enter your details to sign in.</p>
              </div>
              <Form
                name="login"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
                className="flex flex-col gap-5"
              >
                {/* Email Field */}
                <Form.Item
                  name="email"
                  rules={[{ required: true, message: 'Please input your email!' }, { type: 'email', message: 'Please enter a valid email!' }]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="admin@wastemanagement.com"
                    size="large"
                    style={{ height: '48px' }}
                  />
                </Form.Item>
                {/* Password Field */}
                <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Please input your password!' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Enter your password"
                    size="large"
                    style={{ height: '48px' }}
                    iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>
                {/* Actions Row */}
                <div className="flex items-center justify-between">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>Remember me</Checkbox>
                  </Form.Item>
                  <a className="text-sm font-medium text-primary hover:text-primary-dark transition-colors hover:underline" href="#">
                    Forgot password?
                  </a>
                </div>
                {/* Submit Button */}
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    style={{ height: '48px', backgroundColor: '#13ec5b', borderColor: '#13ec5b' }}
                    className="flex items-center justify-center gap-2 mt-2 shadow-lg"
                  >
                    <span>Sign In</span>
                    <LoginOutlined />
                  </Button>
                </Form.Item>
              </Form>
              {/* Footer / Help */}
              <div className="pt-2 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Need help accessing your account?{" "}
                  <a className="text-primary hover:underline ml-1" href="#">
                    Contact Support
                  </a>
                </p>
              </div>
            </div>
            {/* Bottom Decoration */}
            <div className="h-1.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40"></div>
          </div>
          {/* Page Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-white/80 font-medium">© 2023 Waste Management Authority. All rights reserved.</p>
            <div className="flex justify-center gap-4 mt-2 text-xs text-white/60">
              <a className="hover:text-primary transition-colors" href="#">
                Privacy Policy
              </a>
              <span>•</span>
              <a className="hover:text-primary transition-colors" href="#">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
