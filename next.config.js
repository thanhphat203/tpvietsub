/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Nếu dùng custom domain thì bỏ basePath, nếu dùng URL dạng username.github.io/ten-repo thì điền '/ten-repo'
  basePath: process.env.NODE_ENV === 'production' && process.env.REPO_NAME ? `/${process.env.REPO_NAME}` : '',
  images: { unoptimized: true },
  trailingSlash: true,
};

module.exports = nextConfig;
