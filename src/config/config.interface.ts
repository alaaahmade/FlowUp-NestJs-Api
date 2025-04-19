export interface AppConfig {
  port: number;
  nodeEnv: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
}

export interface AppleSignInConfig {
  clientId: string;
  teamId: string;
  keyId: string;
  privateKeyPath: string;
  callbackUrl: string;
}

export interface GoogleAnalyticsConfig {
  clientEmail: string;
  privateKey: string;
  measurementId: string;
  apiSecret: string;
}

export interface Config {
  app: AppConfig;
  database: DatabaseConfig;
  jwt: JwtConfig;
  smtp: SmtpConfig;
  google: GoogleOAuthConfig;
  apple: AppleSignInConfig;
  googleAnalytics: GoogleAnalyticsConfig;
  firebase: {
    projectId: string;
    clientEmail: string;
    privateKey: string;
  };
  stripe: {
    secretKey: string;
    webhookSecret: string;
  };
  s3: {
    accessKeyId: string;
    secretAccessKey: string;
    endpoint: string;
    region: string;
    bucket: string;
  };
  subscription: {
    creditBerJOD: number;
  };
}
