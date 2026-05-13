import axios from 'axios';

const KARTOFFEL_BASE_URL = process.env.KARTOFFEL_BASE_URL || 'https://kartoffel.branch-yesodot.org/api';
const KARTOFFEL_API_KEY = process.env.KARTOFFEL_API_KEY || '';
const KARTOFFEL_ROOT_GROUP_ID = process.env.KARTOFFEL_ROOT_GROUP_ID || '';
const KARTOFFEL_ENABLED = process.env.KARTOFFEL_ENABLED === 'true';

const client = axios.create({
  baseURL: KARTOFFEL_BASE_URL,
  headers: { Authorization: KARTOFFEL_API_KEY },
  timeout: 10000,
});

export type KartoffelEntity = {
  id: string;
  identityCard: string;
  personalNumber: string;
  displayName: string;
  fullName: string;
  rank: string;
  akaUnit: string;
  hierarchy: string;
  serviceType: string;
  phone?: string;
  directGroup?: string;
};

export type KartoffelGroup = {
  id: string;
  name: string;
  hierarchy: string;
  isLeaf?: boolean;
  directGroup?: string;
};

let entityCache: KartoffelEntity[] = [];
let cacheTimestamp: Date | null = null;

export const isKartoffelEnabled = () => KARTOFFEL_ENABLED && !!KARTOFFEL_API_KEY;

export async function searchEntities(query: string): Promise<KartoffelEntity[]> {
  if (!isKartoffelEnabled()) return [];
  try {
    const res = await client.get('/persons/search', {
      params: { fullName: query, underGroupId: KARTOFFEL_ROOT_GROUP_ID },
    });
    return res.data || [];
  } catch (err) {
    console.error('[Kartoffel] Search failed:', (err as Error).message);
    return [];
  }
}

export async function getEntityByPersonalNumber(personalNumber: string): Promise<KartoffelEntity | null> {
  if (!isKartoffelEnabled()) return null;
  try {
    const res = await client.get(`/persons/personalNumber/${personalNumber}`);
    return res.data || null;
  } catch {
    return null;
  }
}

export async function getEntityByIdentityCard(identityCard: string): Promise<KartoffelEntity | null> {
  if (!isKartoffelEnabled()) return null;
  try {
    const res = await client.get(`/persons/identifier/${identityCard}`);
    return res.data || null;
  } catch {
    return null;
  }
}

export async function getGroupMembers(groupId: string): Promise<KartoffelEntity[]> {
  if (!isKartoffelEnabled()) return [];
  try {
    const res = await client.get(`/persons/group/${groupId}`);
    return res.data || [];
  } catch {
    return [];
  }
}

export async function getGroupChildren(groupId: string): Promise<KartoffelGroup[]> {
  if (!isKartoffelEnabled()) return [];
  try {
    const res = await client.get(`/groups/children/${groupId}`);
    return res.data || [];
  } catch {
    return [];
  }
}

export async function getRootMembers(): Promise<KartoffelEntity[]> {
  if (!isKartoffelEnabled() || !KARTOFFEL_ROOT_GROUP_ID) return [];
  try {
    const res = await client.get(`/persons/group/${KARTOFFEL_ROOT_GROUP_ID}`, {
      params: { expanded: true },
    });
    entityCache = res.data || [];
    cacheTimestamp = new Date();
    return entityCache;
  } catch (err) {
    console.error('[Kartoffel] Failed to fetch root members:', (err as Error).message);
    return entityCache;
  }
}

export function getCachedMembers(): KartoffelEntity[] {
  return entityCache;
}

export function getCacheTimestamp(): Date | null {
  return cacheTimestamp;
}
