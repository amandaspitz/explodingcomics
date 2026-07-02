declare namespace Express {
  export interface Request {
    requestId: string;
    adminUser?: {
      id: number;
      email: string;
      status: string;
      tokenExpiresAt: string;
    };
  }
}
