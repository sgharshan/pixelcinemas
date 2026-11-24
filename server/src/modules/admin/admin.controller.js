import { getAdminStats } from './admin.service.js'; export async function stats(_request, response) { response.json(await getAdminStats()); }
