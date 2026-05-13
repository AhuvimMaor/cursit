import axios from 'axios';
import https from 'https';

const KARTOFFEL_BASE_URL = process.env.KARTOFFEL_BASE_URL || 'https://kartoffel.branch-yesodot.org/api';
const KARTOFFEL_API_KEY = process.env.KARTOFFEL_API_KEY || '';
const KARTOFFEL_ROOT_GROUP_ID = process.env.KARTOFFEL_ROOT_GROUP_ID || '';
const KARTOFFEL_ENABLED = process.env.KARTOFFEL_ENABLED === 'true';

const client = axios.create({
  baseURL: KARTOFFEL_BASE_URL,
  headers: { Authorization: KARTOFFEL_API_KEY },
  timeout: 10000,
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
});

export type KartoffelEntity = {
  _id: string;
  identityCard: string;
  personalNumber: string;
  displayName: string;
  fullName: string;
  firstName: string;
  lastName: string;
  rank?: string;
  akaUnit?: string;
  hierarchy?: string;
  serviceType?: string;
  phone?: string[];
  entityType?: string;
  directGroup?: string;
};

export type KartoffelGroup = {
  _id: string;
  id?: string;
  name: string;
  hierarchy?: string;
  isLeaf?: boolean;
};

let entityCache: KartoffelEntity[] = [];
let cacheTimestamp: Date | null = null;

export const isKartoffelEnabled = () => KARTOFFEL_ENABLED && !!KARTOFFEL_API_KEY;

export async function searchEntities(query: string): Promise<KartoffelEntity[]> {
  if (!isKartoffelEnabled()) return [];
  try {
    const res = await client.get('/entities/search', {
      params: { fullName: query },
    });
    return res.data || [];
  } catch (err) {
    console.error('[Kartoffel] Search failed:', (err as Error).message);
    return [];
  }
}

export async function getEntitiesByGroup(groupId: string): Promise<KartoffelEntity[]> {
  if (!isKartoffelEnabled()) return [];
  try {
    const res = await client.get(`/entities/group/${groupId}`, {
      params: { page: 1, pageSize: 100 },
    });
    return res.data || [];
  } catch (err) {
    console.error('[Kartoffel] Group members failed:', (err as Error).message);
    return [];
  }
}

export async function getEntityByIdentifier(identifier: string): Promise<KartoffelEntity | null> {
  if (!isKartoffelEnabled()) return null;
  try {
    const res = await client.get(`/entities/identifier/${identifier}`);
    return res.data || null;
  } catch {
    return null;
  }
}

export async function getAllEntities(page = 1, pageSize = 100): Promise<KartoffelEntity[]> {
  if (!isKartoffelEnabled()) return [];
  try {
    const res = await client.get('/entities', {
      params: { page, pageSize },
    });
    return res.data || [];
  } catch (err) {
    console.error('[Kartoffel] Get all failed:', (err as Error).message);
    return [];
  }
}

export async function getGroups(page = 1, pageSize = 100): Promise<KartoffelGroup[]> {
  if (!isKartoffelEnabled()) return [];
  try {
    const res = await client.get('/groups', {
      params: { page, pageSize },
    });
    return res.data || [];
  } catch {
    return [];
  }
}

export async function loadMembers(): Promise<KartoffelEntity[]> {
  if (!isKartoffelEnabled()) return [];
  try {
    const allEntities: KartoffelEntity[] = [];
    let page = 1;
    let hasMore = true;
    while (hasMore && page <= 5) {
      const batch = await getAllEntities(page, 100);
      allEntities.push(...batch);
      hasMore = batch.length === 100;
      page++;
    }
    entityCache = allEntities;
    cacheTimestamp = new Date();
    console.log(`[Kartoffel] Loaded ${entityCache.length} members`);
    return entityCache;
  } catch (err) {
    console.error('[Kartoffel] Load failed:', (err as Error).message);
    return entityCache;
  }
}

export function getCachedMembers(): KartoffelEntity[] {
  return entityCache;
}

export function getCacheTimestamp(): Date | null {
  return cacheTimestamp;
}
