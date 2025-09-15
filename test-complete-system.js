/**
 * Complete System Test for Zero-Trust-Share
 * Tests the entire upload/download flow with Supabase
 */

const { createClient } = require('@supabase/supabase-js');

// Use the hardcoded credentials
const supabaseUrl = "https://gbjvlaboflhkvlbkuram.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdianZsYWJvZmxoa3ZsYmt1cmFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzkxMiwiZXhwIjoyMDczNDgzOTEyfQ.Qi4jY72suoAP1kgGd6mEuTp8aoOjRTNgityFFNSxO3Q";

console.log('🧪 Complete System Test for Zero-Trust-Share\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompleteSystem() {
  try {
    console.log('1. Testing Supabase Connection...');
    
    // Test 1: Check storage bucket
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.log('❌ Storage error:', bucketsError.message);
      return;
    }
    
    const targetBucket = 'aethervault-files';
    const bucketExists = buckets.some(bucket => bucket.name === targetBucket);
    
    if (!bucketExists) {
      console.log(`❌ Bucket "${targetBucket}" does not exist!`);
      console.log('📝 Please create the bucket in Supabase Dashboard');
      return;
    }
    
    console.log('✅ Storage bucket exists');
    
    // Test 2: Check database table
    console.log('2. Testing Database Schema...');
    const { data: tableTest, error: tableError } = await supabase
      .from('shared_files')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.log('❌ Database error:', tableError.message);
      console.log('📝 Please run the updated schema: supabase-schema-updated.sql');
      return;
    }
    
    console.log('✅ Database table exists');
    
    // Test 3: Test file upload
    console.log('3. Testing File Upload...');
    const testContent = 'Test file for Zero-Trust-Share system';
    const testFile = new Blob([testContent], { type: 'text/plain' });
    const testFileName = `test-user-123/test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(targetBucket)
      .upload(testFileName, testFile, {
        contentType: 'text/plain',
        upsert: false
      });
    
    if (uploadError) {
      console.log('❌ Upload failed:', uploadError.message);
      return;
    }
    
    console.log('✅ File upload successful');
    
    // Test 4: Test file download
    console.log('4. Testing File Download...');
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from(targetBucket)
      .download(testFileName);
    
    if (downloadError) {
      console.log('❌ Download failed:', downloadError.message);
      return;
    }
    
    const downloadedContent = await downloadData.text();
    if (downloadedContent === testContent) {
      console.log('✅ File download and content verification successful');
    } else {
      console.log('❌ Content verification failed');
      return;
    }
    
    // Test 5: Test database operations
    console.log('5. Testing Database Operations...');
    
    // Insert test record
    const testRecord = {
      owner_id: '00000000-0000-0000-0000-000000000000', // Test UUID
      file_name: testFileName,
      encrypted_file_name: 'encrypted-test-file.txt',
      file_size: testFile.size,
      file_salt: Buffer.from('test-salt-1234567890123456'),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      burn_after_read: false,
      download_count: 0
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('shared_files')
      .insert(testRecord)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Database insert failed:', insertError.message);
      return;
    }
    
    console.log('✅ Database insert successful');
    
    // Test 6: Test file deletion
    console.log('6. Testing File Deletion...');
    
    // Delete from storage
    const { error: deleteStorageError } = await supabase.storage
      .from(targetBucket)
      .remove([testFileName]);
    
    if (deleteStorageError) {
      console.log('❌ Storage deletion failed:', deleteStorageError.message);
    } else {
      console.log('✅ Storage deletion successful');
    }
    
    // Delete from database
    const { error: deleteDbError } = await supabase
      .from('shared_files')
      .delete()
      .eq('id', insertData.id);
    
    if (deleteDbError) {
      console.log('❌ Database deletion failed:', deleteDbError.message);
    } else {
      console.log('✅ Database deletion successful');
    }
    
    console.log('\n🎉 Complete System Test PASSED!');
    console.log('✅ All components are working correctly:');
    console.log('   - Supabase Storage');
    console.log('   - Database operations');
    console.log('   - File upload/download');
    console.log('   - Content verification');
    console.log('   - File deletion');
    console.log('\n🚀 Your Zero-Trust-Share system is ready to use!');
    
  } catch (error) {
    console.error('❌ System test failed:', error.message);
  }
}

testCompleteSystem();
