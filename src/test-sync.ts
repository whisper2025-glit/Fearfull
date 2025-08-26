// Temporary test file to debug user sync
import { createOrUpdateUser, supabase } from './lib/supabase';

// Test the user sync function with mock data
const testSync = async () => {
  console.log('Testing Supabase connection...');
  
  // Test basic connection
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count(*)')
      .single();
    
    console.log('Supabase connection test:', { data, error });
  } catch (err) {
    console.error('Supabase connection failed:', err);
  }

  // Test user creation with mock Clerk user
  const mockClerkUser = {
    id: 'test_clerk_123',
    firstName: 'Test',
    fullName: 'Test User',
    username: 'testuser',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
    imageUrl: null
  };

  console.log('Testing user sync with mock data...');
  
  try {
    const result = await createOrUpdateUser(mockClerkUser);
    console.log('User sync successful:', result);
  } catch (err) {
    console.error('User sync failed:', err);
  }
};

// Run test if this file is executed directly
if (typeof window !== 'undefined') {
  (window as any).testSync = testSync;
  console.log('Test function available as window.testSync()');
}

export { testSync };
