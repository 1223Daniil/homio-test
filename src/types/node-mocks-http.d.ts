declare module "node-mocks-http" {
  import { NextApiRequest, NextApiResponse } from "next";

  export function createMocks<T = any>({
    method,
    url,
    query,
    params,
    body,
    session
  }?: {
    method?: string;
    url?: string;
    query?: Record<string, any>;
    params?: Record<string, any>;
    body?: T;
    session?: Record<string, any>;
  }): {
    req: NextApiRequest;
    res: NextApiResponse;
  };
}
