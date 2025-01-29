import { DefaultSession } from 'next-auth';
import { Role } from '@prisma/client';

declare module 'next-auth' {
    interface User {
        role: Role;
        username: username;
    }

    interface Session {
        user: {
            role: Role;
            username: username;
        } & DefaultSession['user']
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        role: Role;
        username: username;
    }
}