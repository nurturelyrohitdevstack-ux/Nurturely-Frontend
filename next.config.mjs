/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_URL:
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_API ||
      "http://localhost:5000/api",
    APP_NAME:
      process.env.APP_NAME ||
      process.env.NEXT_PUBLIC_APP_NAME ||
      "Nurturely",
  },
};

export default nextConfig;
