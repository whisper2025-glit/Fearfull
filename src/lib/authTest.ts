import { supabase, setSupabaseAuth } from './supabase';

/**
 * Test function to verify Clerk-Supabase authentication integration
 * This can be called in the browser console to debug auth issues
 */
export const testAuthentication = async (getToken: () => Promise<string | null>) => {
  console.log('🧪 Testing Clerk-Supabase Authentication Integration...\n');

  try {
    // Test 1: Get Clerk token
    console.log('1. Testing Clerk token retrieval...');
    const token = await getToken({ template: 'supabase' });
    
    if (!token) {
      console.error('❌ No token received from Clerk');
      console.log('💡 This usually means:');
      console.log('   - Clerk JWT template "supabase" is not configured');
      console.log('   - User is not properly signed in');
      console.log('   - Clerk integration needs setup');
      return false;
    }
    
    console.log('✅ Clerk token retrieved successfully');
    console.log('   Token length:', token.length);
    console.log('   Token preview:', token.substring(0, 50) + '...');

    // Test 2: Set Supabase auth
    console.log('\n2. Testing Supabase auth setup...');
    await setSupabaseAuth(token);
    console.log('✅ Supabase auth session set successfully');

    // Test 3: Test authenticated request
    console.log('\n3. Testing authenticated Supabase request...');
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Supabase auth error:', authError);
      return false;
    }
    
    if (!authUser.user) {
      console.error('❌ No authenticated user in Supabase');
      return false;
    }

    console.log('✅ Supabase user authenticated:');
    console.log('   User ID:', authUser.user.id);
    console.log('   Email:', authUser.user.email);
    console.log('   Role:', authUser.user.role);

    // Test 4: Test database access
    console.log('\n4. Testing database access...');
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.user.id)
      .single();

    if (dbError) {
      console.warn('⚠️ Database access error:', dbError);
      console.log('💡 This might be normal if user data doesn\'t exist yet');
    } else {
      console.log('✅ Database access successful:');
      console.log('   Username:', userData?.username);
      console.log('   Full name:', userData?.full_name);
      console.log('   Email:', userData?.email);
    }

    console.log('\n🎉 Authentication integration test completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Authentication test failed:', error);
    console.log('\n💡 Common solutions:');
    console.log('   1. Configure Clerk JWT template named "supabase"');
    console.log('   2. Set up Supabase third-party auth for Clerk');
    console.log('   3. Check environment variables');
    console.log('   4. Clear browser storage and sign in again');
    return false;
  }
};

/**
 * Quick helper to test if user has proper display name
 */
export const testUserDisplayName = async (clerkUser: any) => {
  console.log('🧪 Testing user display name resolution...\n');
  
  if (!clerkUser) {
    console.log('❌ No Clerk user provided');
    return 'User';
  }

  console.log('Clerk user data:');
  console.log('  ID:', clerkUser.id);
  console.log('  Full name:', clerkUser.fullName);
  console.log('  First name:', clerkUser.firstName);
  console.log('  Username:', clerkUser.username);
  console.log('  Email:', clerkUser.emailAddresses?.[0]?.emailAddress);

  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('username, full_name')
      .eq('id', clerkUser.id)
      .single();

    if (!error && userData) {
      console.log('\nSupabase user data:');
      console.log('  Username:', userData.username);
      console.log('  Full name:', userData.full_name);
      
      const finalName = userData.full_name || userData.username || 
                       clerkUser.fullName || clerkUser.firstName || 
                       clerkUser.username || 'User';
      
      console.log('\n✅ Final display name:', finalName);
      return finalName;
    } else {
      console.log('\n⚠️ No Supabase user data found, using Clerk fallback');
      const fallbackName = clerkUser.fullName || clerkUser.firstName || 
                           clerkUser.username || 'User';
      console.log('✅ Fallback display name:', fallbackName);
      return fallbackName;
    }
  } catch (error) {
    console.error('❌ Error testing display name:', error);
    return 'User';
  }
};

// Helper to expose to global scope for console debugging
if (typeof window !== 'undefined') {
  (window as any).authTest = { testAuthentication, testUserDisplayName };
  console.log('🛠️ Auth test helpers available in console:');
  console.log('   window.authTest.testAuthentication(getToken)');
  console.log('   window.authTest.testUserDisplayName(user)');
}
