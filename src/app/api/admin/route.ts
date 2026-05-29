import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const runtime = 'edge';

// In-memory store (use KV/D1 in production Cloudflare)
const USERS: any[] = [
  {
    id: '1', name: 'Administrator', email: 'admin@tendersystem.id',
    role: 'admin', company: 'PT. Tender Intelligence Indonesia',
    isActive: true, createdAt: '2024-01-01T00:00:00.000Z',
    lastLogin: new Date().toISOString(), analysisCount: 12, accessExpiry: null,
  },
  {
    id: '2', name: 'Demo Analyst', email: 'analyst@tendersystem.id',
    role: 'analyst', company: 'PT. Demo Konstruksi',
    isActive: true, createdAt: '2024-02-15T00:00:00.000Z',
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    analysisCount: 47, accessExpiry: '2025-12-31T23:59:59.000Z',
  },
  {
    id: '3', name: 'Budi Santoso', email: 'budi.santoso@ptjaya.co.id',
    role: 'analyst', company: 'PT. Jaya Konstruksi',
    isActive: true, createdAt: '2024-03-10T00:00:00.000Z',
    lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    analysisCount: 23, accessExpiry: '2025-06-30T23:59:59.000Z',
  },
  {
    id: '4', name: 'Siti Rahayu', email: 'siti.r@wirasakti.id',
    role: 'viewer', company: 'CV. Wira Sakti',
    isActive: false, createdAt: '2024-04-05T00:00:00.000Z',
    lastLogin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    analysisCount: 8, accessExpiry: '2024-12-31T23:59:59.000Z',
  },
];

async function checkAdmin(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  return token?.role === 'admin' ? token : null;
}

export async function GET(request: NextRequest) {
  const admin = await checkAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json({ users: USERS });
}

export async function POST(request: NextRequest) {
  const admin = await checkAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { action, userId, data } = await request.json();

  if (action === 'create') {
    const newUser = {
      id: `user-${Date.now()}`,
      name: data.name, email: data.email,
      role: data.role || 'analyst', company: data.company || '',
      isActive: true, createdAt: new Date().toISOString(),
      lastLogin: null, analysisCount: 0,
      accessExpiry: data.accessExpiry || null,
    };
    USERS.push(newUser);
    return NextResponse.json({ user: newUser, message: 'Pengguna berhasil dibuat' });
  }

  if (action === 'toggle_active') {
    const user = USERS.find(u => u.id === userId);
    if (!user) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });
    user.isActive = !user.isActive;
    return NextResponse.json({
      user,
      message: `Akun berhasil ${user.isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
    });
  }

  if (action === 'extend_access') {
    const user = USERS.find(u => u.id === userId);
    if (!user) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });
    user.accessExpiry = data.newExpiry;
    return NextResponse.json({ user, message: 'Akses berhasil diperpanjang' });
  }

  return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 });
}
