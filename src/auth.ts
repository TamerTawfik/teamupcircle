import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient, Role } from "@prisma/client"
import authConfig from "./auth.config"
import { Adapter } from "next-auth/adapters";
import { Resend } from 'resend';
import { EmailTemplate } from '@/components/email-template';


const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY);

export const { auth, handlers, signIn, signOut } = NextAuth({
    session: {
        strategy: "jwt", 
      },
      callbacks: {
        // Called when a JWT is created or updated
        async jwt({ token, user, trigger }) {
           // The 'user' object is available on initial sign-in
           // It comes from the AdapterUser structure after profile mapping and adapter processing
           if (trigger === "signIn" || trigger === "signUp") {
            // Ensure user object and custom fields exist
             if(user) {
                 const dbUser = await prisma.user.findUnique({
                     where: { id: user.id },
                     select: { username: true, githubId: true, role: true }
                 });
                 token.id = user.id;
                 token.username = dbUser?.username;
                 token.githubId = dbUser?.githubId;
                 token.role = dbUser?.role;

                 // Send welcome email on sign up
                 if (trigger === "signUp" && user.email) {
                    const firstName = user.name?.split(' ')[0] || 'there';
                    try {
                      await resend.emails.send({
                        from: 'Teamup-Circle <no-reply@teamupcircle.com>',
                        to: [user.email],
                        subject: 'Welcome to Teamup Circle!',
                        react: await EmailTemplate({ firstName: firstName }), 
                      });
                      console.log(`Welcome email sent to ${user.email}`);
                    } catch (error) {
                      console.error("Failed to send welcome email:", error);
                    }
                 }
             }
           }
          // On subsequent calls, token exists, return it
          return token;
        },
    
        // Called when a session is checked
        async session({ session, token }) {
          // Add custom properties from the JWT token to the session object
          if (token && session.user) {
            session.user.id = token.id as string;
            session.user.username = token.username as string | null;
            session.user.githubId = token.githubId as string | null;
            session.user.role = token.role as Role;
            // Keep default fields (name, email, image) populated by NextAuth default behavior
          }
          return session;
        },
    
         // signIn is still useful for adapter interaction on login/signup
         async signIn({ user, account }) {
              console.log(`Sign-in attempt: User ID ${user.id}, Provider: ${account?.provider}`);
              // Adapter handles user creation/linking based on profile data during sign-in
              return true;
         }
      },
    adapter: PrismaAdapter(prisma) as Adapter,
    ...authConfig,
})