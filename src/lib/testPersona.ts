import { supabase } from './supabase';

// Simple test function to check if we can create a persona
export const testPersonaCreation = async (userId: string) => {
  try {
    console.log('🧪 Testing persona creation...');
    
    const { data, error } = await supabase
      .from('personas')
      .insert({
        user_id: userId,
        name: 'Test Persona',
        gender: 'Male',
        description: 'Test description',
        is_default: false
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Test failed with error:', error);
      return { success: false, error };
    }

    console.log('✅ Test successful:', data);
    
    // Clean up test data
    await supabase
      .from('personas')
      .delete()
      .eq('id', data.id);

    return { success: true, data };
  } catch (error) {
    console.error('❌ Test exception:', error);
    return { success: false, error };
  }
};
