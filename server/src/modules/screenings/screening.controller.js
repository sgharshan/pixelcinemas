import { cancelScreening, createScreening, getScreening, listScreenings, updateScreening } from './screening.service.js';
export async function list(request, response) { response.json({ screenings: await listScreenings(request.validated?.query ?? request.query) }); }
export async function detail(request, response) { response.json({ screening: await getScreening(request.params.id) }); }
export async function create(request, response) { response.status(201).json({ screening: await createScreening(request.body) }); }
export async function update(request, response) { response.json({ screening: await updateScreening(request.params.id, request.body) }); }
export async function cancel(request, response) { response.json({ screening: await cancelScreening(request.params.id) }); }
