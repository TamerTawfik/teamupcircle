import Github from "next-auth/providers/github"
import type  {NextAuthConfig}  from "next-auth"

export default {
  providers: [
    Github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: { scope: "read:user user:email" },
      },
      profile(profile) {
       
        return {
          id: profile.id.toString(), 
          name: profile.name ?? profile.login, 
          email: profile.email,       
          image: profile.avatar_url, 
          username: profile.login,   
          githubId: profile.id.toString(), 
          location: profile.location,
          role: "MEMBER",
        };
      },
    }),
  ],
} satisfies NextAuthConfig