import type { ReadinessDependencyChecker, ReadinessDependencyStatus } from "../contracts/readiness-dependency-checker";

export interface GetReadinessStatusDependencies {
  appName: string;
  environment: string;
  dependencyCheckers?: ReadinessDependencyChecker[];
}

export interface ReadinessStatus {
  status: "ready";
  service: string;
  environment: string;
  timestamp: string;
  dependencies: ReadinessDependencyStatus[];
}

export class GetReadinessStatus {
  constructor(private readonly dependencies: GetReadinessStatusDependencies) {}

  async execute(now: Date = new Date()): Promise<ReadinessStatus> {
    const dependencyStatuses = this.dependencies.dependencyCheckers
      ? await Promise.all(this.dependencies.dependencyCheckers.map((dependencyChecker) => dependencyChecker.check()))
      : [];

    return {
      status: "ready",
      service: this.dependencies.appName,
      environment: this.dependencies.environment,
      timestamp: now.toISOString(),
      dependencies: dependencyStatuses,
    };
  }
}
