export interface ReadinessDependencyStatus {
  name: string;
  status: "up";
  details?: Record<string, unknown>;
}

export interface ReadinessDependencyChecker {
  check(): Promise<ReadinessDependencyStatus>;
}
