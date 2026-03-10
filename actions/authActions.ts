'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db';
import { User } from '@/models/User';

export async function loginUser(formData: FormData) {
  const identifier = formData.get('identifier') as string;
  const password = formData.get('password') as string;

  try {
    // Attempt database connection first
    await connectToDatabase();
    
    // First, check if the default 'TPI Accounts' user exists in the DB.
    // If it doesn't, we'll cleanly seed it for the IT department as requested.
    const defaultUserExists = await User.findOne({ username: 'TPI Accounts' });
    if (!defaultUserExists) {
      console.log('Seeding default TPI Accounts user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('TPI1634lagos', salt);
      
      await User.create({
        username: 'TPI Accounts',
        email: 'tpiaccounts@tpi.com',
        passwordHash: hashedPassword,
        role: 'admin'
      });
      console.log('Default Admin seeded successfully.');
    }

    // Now look for the user trying to login (supports username or email)
    const user = await User.findOne({
      $or: [
        { username: identifier },
        { email: identifier.toLowerCase() }
      ]
    });

    if (!user) {
      return { error: 'Invalid credentials. Please contact IT support.' };
    }

    // Check if password matches the hash stored in DB
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (isPasswordValid) {
      // Login successful: cookie expires in 7 days
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      const cookieStore = await cookies();
      cookieStore.set('auth_token', String(user._id), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires,
        path: '/'
      });
      
      // Store minimal user info context in a non-httpOnly cookie for the UI if needed
      cookieStore.set('user_info', JSON.stringify({ 
        username: user.username, 
        role: user.role 
      }), {
        path: '/'
      });
      
    } else {
      return { error: 'Invalid credentials. Please contact IT support.' };
    }
    
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Authentication error:', err.message);
    
    // Help user identify connection issues in production
    if (err.message?.includes('MONGODB_URI') || err.message?.includes('connection') || err.message?.includes('buffering timed out')) {
      return { error: 'Database connection failed. Please check if MONGODB_URI is set in Vercel and your IP is whitelisted on Atlas.' };
    }
    
    return { error: `Server error: ${err.message || 'Please try again.'}` };
  }
  
  // Successful auth redirection MUST happen outside try/catch to work in Next.js Server Actions
  redirect('/'); 
}


export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  redirect('/login');
}
