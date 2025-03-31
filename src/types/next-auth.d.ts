import { DefaultSession } from 'next-auth';
import { Role } from '@prisma/client';

declare module 'next-auth' {
    interface User {
        role: Role;
        username: string | null;
        githubId: string | null;
    }

    interface Session {
        user: {
            role: Role;
            username: string | null;
        githubId: string | null;
        } & DefaultSession['user']
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        role: Role;
        username: string | null;
        githubId: string | null;
    }
}