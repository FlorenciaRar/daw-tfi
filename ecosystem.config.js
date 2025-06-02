module.exports = {
  apps: [
    {
      name: 'encuestas',
      script: 'dist/main.js',
      //Esta config usaremos para produccion y el .env para desarrollo
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        CORS_ORIGIN: 'localhost',
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_USER: 'postgres', //lo cambie por el mio
        DB_PASSWORD: 'pongan su contraseña', //lo cambie por el mio
        DB_NAME: 'encuestas',
        DB_LOGGING: 'false', //typeORM no imprima los logs de consultas en modo prod
        GLOBAL_PREFIX: 'api',
        SWAGGER_HABILITADO: false,
      },
      time: true, //fecha y hora en los logs
    },
  ],
};
