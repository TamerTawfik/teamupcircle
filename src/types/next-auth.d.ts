import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface User {
        username: username;
    }

    interface Session {
        user: {
            username: username;
        } & DefaultSession['user']
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        username: username;
    }
}