export interface GetHealthStatusDependencies {
  appName: string;
  environment: string;
}

export interface HealthStatus {
  status: "ok";
  service: string;
  environment: string;
  timestamp: string;
  uptimeSeconds: number;
}

export class GetHealthStatus {
  constructor(private readonly dependencies: GetHealthStatusDependencies) {}

  execute(now: Date = new Date()): HealthStatus {
    return {
      status: "ok",
      service: this.dependencies.appName,
      environment: this.dependencies.environment,
      timestamp: now.toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    };
  }
}
