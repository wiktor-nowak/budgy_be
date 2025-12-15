const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3003"),
  debug: process.env.APP_DEBUG === "true",
  appSecret: process.env.JWT_SECRET || "",
  domain: process.env.AUTH0_DOMAIN || "",
  audience: process.env.AUTH0_AUDIENCE || "",
  clientId: process.env.AUTH0_CLIENT_ID || "",
  clientSecret: process.env.AUTH0_CLIENT_SECRET || "",
};

export default config;
