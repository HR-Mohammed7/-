import app, { createServer } from '../server';

let serverPromise: Promise<any> | null = null;

export default async function handler(req: any, res: any) {
  if (!serverPromise) {
    serverPromise = createServer();
  }
  const establishedApp = await serverPromise;
  return establishedApp(req, res);
}
