import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const USERS_DB = [
  {
    id: '1',
    name: 'Administrator',
    email: 'admin@tendersystem.id',
    password: 'adminazka',
    role: 'admin' as const,
    company: 'PT. Tender Intelligence Indonesia',
    isActive: true,
    analysisCount: 12,
  },
  {
    id: '2',
    name: 'Demo Analyst',
    email: 'analyst@tendersystem.id',
    password: 'adminazka',
    role: 'analyst' as const,
    company: 'PT. Demo Konstruksi',
    isActive: true,
    analysisCount: 47,
  },
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password diperlukan');
        }

        const user = USERS_DB.find(
          u => u.email.toLowerCase() === credentials.email.toLowerCase()
        );

        if (!user) throw new Error('Email atau password tidak valid');
        if (!user.isActive) throw new Error('Akun dinonaktifkan. Hubungi administrator.');

        const isValid = credentials.password === user.password;

        if (!isValid) throw new Error('Email atau password tidak valid');

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.company = (user as any).company;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).company = token.company;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production-32chars',
};
