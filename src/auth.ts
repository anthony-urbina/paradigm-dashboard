import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
      role: string;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    async signIn() {
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user?.email || trigger === "signIn") {
        token.email = user?.email ?? token.email;
        token.name = user?.name ?? token.name;
        token.picture = user?.image ?? token.picture;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = "";
      session.user.name = (token.name as string | undefined) ?? session.user.name;
      session.user.email = (token.email as string | undefined) ?? session.user.email;
      session.user.image = (token.picture as string | null | undefined) ?? session.user.image;
      session.user.role = "agent";
      return session;
    },
  },
});
