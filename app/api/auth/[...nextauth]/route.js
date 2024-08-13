import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

import User from '@models/user';
import { connectToDB } from '@utils/database';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_KEY,
    })
  ],
   callbacks: {
    async session({ session }) {
      console.log("client env666---",session)
      // store the user id from MongoDB to session
      const sessionUser = await User.findOne({ email: session.user.email });
      if(sessionUser)
      session.user.id = sessionUser._id.toString();

      return session;
    },
    async signIn({ account, profile, user, credentials }) {
      console.log("client env777---",profile)
      try {
        await connectToDB();
        console.log("client env777---",profile)
        debugger
        // check if user already exists
        const userExists = await User.findOne({ email: profile.email });

        // if not, create a new document and save user in MongoDB
        if (!userExists) {
          await User.create({
            email: profile.email,
            username: profile.given_name,
            image: profile.picture,
          });
        }

        return true
      } catch (error) {
        console.log("Error checking if user exists: ", error.message);
        return false
      }
    },
  }  
})

export { handler as GET, handler as POST }
