module.exports = {
  apps: [
    //cada objeto van a ser las aplicaciones que queremos configurar con este archiv de config
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
        DB_PASSWORD: 'Chiste2704', //lo cambie por el mio
        DB_NAME: 'encuestas',
        DB_LOGGING: 'false', //typeORM no imprima los logs de consultas
        GLOBAL_PREFIX: 'api',
        SWAGGER_HABILITADO: false,
      },
      time: true, //fecha y hora en los logs
    },
  ],
};
