/**
 * Simple Supabase Connection Test
 */

const { createClient } = require('@supabase/supabase-js');

// Use the hardcoded credentials from supabase.ts
const supabaseUrl = "https://gbjvlaboflhkvlbkuram.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdianZsYWJvZmxoa3ZsYmt1cmFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzkxMiwiZXhwIjoyMDczNDgzOTEyfQ.Qi4jY72suoAP1kgGd6mEuTp8aoOjRTNgityFFNSxO3Q";

console.log('🔍 Testing Supabase Connection...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('📋 Testing basic connection...');
    
    // Test 1: List buckets
    console.log('1. Testing Storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.log('❌ Storage error:', bucketsError.message);
      return;
    }
    
    console.log('✅ Storage connection successful!');
    console.log('📦 Available buckets:');
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'Public' : 'Private'})`);
    });
    
    // Test 2: Check if our bucket exists
    const targetBucket = 'aethervault-files';
    const bucketExists = buckets.some(bucket => bucket.name === targetBucket);
    
    if (bucketExists) {
      console.log(`✅ Bucket "${targetBucket}" exists!`);
      
      // Test 3: List files in bucket
      console.log('2. Testing file listing...');
      const { data: files, error: filesError } = await supabase.storage
        .from(targetBucket)
        .list('', { limit: 5 });
      
      if (filesError) {
        console.log('⚠️  File listing error:', filesError.message);
      } else {
        console.log(`✅ File listing successful! Found ${files.length} files`);
        if (files.length > 0) {
          files.forEach(file => {
            console.log(`   - ${file.name}`);
          });
        }
      }
    } else {
      console.log(`❌ Bucket "${targetBucket}" does not exist!`);
      console.log('📝 You need to create this bucket in Supabase Dashboard');
    }
    
    // Test 4: Test database connection
    console.log('3. Testing database connection...');
    const { data: dbTest, error: dbError } = await supabase
      .from('shared_files')
      .select('count')
      .limit(1);
    
    if (dbError) {
      console.log('❌ Database error:', dbError.message);
      console.log('📝 You may need to run the database schema');
    } else {
      console.log('✅ Database connection successful!');
    }
    
    console.log('\n🎉 Connection test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testConnection();
