import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      role: string;
      permissions: any;
    };
  }
}

export interface SucceessResponseParams {
    message:String,
    data?:any
}

export interface ErrorResponseParams {
    message:String,
    errors?:any
}