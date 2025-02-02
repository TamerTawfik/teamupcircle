import Github from "next-auth/providers/github"
import type  {NextAuthConfig}  from "next-auth"

export default {
    providers: [
        
        Github({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            profile(profile) {
                return {
                  name: profile.name || profile.login,
                  email: profile.email,
                  image: profile.avatar_url,
                  username: profile.login,
                  role: "MEMBER",
                };
              },
        }),
        
    ],
} satisfies NextAuthConfig