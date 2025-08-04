import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { 
        params: { 
          scope: "openid email profile https://www.googleapis.com/auth/youtube.readonly" 
        } 
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }: any) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }: any) {
      session.accessToken = token.accessToken
      return session
    }
  },
  pages: {
    signIn: '/',
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 