export interface HealthCheck {
  status: 'ok' | 'error';
  message?: string;
  details?: any;
  timestamp: string;
}

export interface HealthResponse {
  service: string;
  status: 'healthy' | 'unhealthy';
  checks: {
    [key: string]: HealthCheck;
  };
}