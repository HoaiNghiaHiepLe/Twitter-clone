// eslint-disable-next-line no-undef
module.exports = {
  apps: [
    {
      name: 'Twitter-Clone',
      // if run after npm run build, use
      // script: 'node dist/index.js',
      // if apply code in development, use
      script: 'npm run dev',
      env: {
        NODE_ENV: 'development',
        // Riêng NODE_ENV thì có thể dùng process.env.NODE_ENV hoặc process.NODE_ENV, còn lại thì chỉ được dùng process.env.TEN_BIEN
        TEN_BIEN: 'Gia_Tri'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      env_staging: {
        NODE_ENV: 'staging'
      }
    }
  ]
}
