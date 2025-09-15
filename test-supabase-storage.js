/**
 * Test Supabase Storage Configuration
 * Run this to verify your Supabase Storage setup
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing Supabase Storage Configuration...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${supabaseKey ? '✅ Set' : '❌ Missing'}\n`);

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing required environment variables. Please check your .env.local file.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseStorage() {
  try {
    console.log('🔗 Testing Supabase connection...');
    
    // Test connection by listing buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.log('❌ Supabase connection failed:', bucketsError.message);
      return;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('📦 Available buckets:');
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'Public' : 'Private'})`);
    });
    
    // Check if our bucket exists
    const targetBucket = 'aethervault-files';
    const bucketExists = buckets.some(bucket => bucket.name === targetBucket);
    
    if (bucketExists) {
      console.log(`✅ Your bucket "${targetBucket}" exists!`);
      
      // List files in the bucket
      const { data: files, error: filesError } = await supabase.storage
        .from(targetBucket)
        .list('', { limit: 10 });
      
      if (filesError) {
        console.log('⚠️  Could not list files:', filesError.message);
      } else {
        console.log(`📁 Files in bucket (${files.length} found):`);
        if (files.length === 0) {
          console.log('   - Bucket is empty');
        } else {
          files.forEach(file => {
            console.log(`   - ${file.name} (${file.metadata?.size || 'unknown size'})`);
          });
        }
      }
    } else {
      console.log(`❌ Your bucket "${targetBucket}" does not exist!`);
      console.log('📝 To create the bucket:');
      console.log('   1. Go to your Supabase Dashboard');
      console.log('   2. Navigate to Storage');
      console.log('   3. Click "Create a new bucket"');
      console.log('   4. Name: aethervault-files');
      console.log('   5. Make it Private');
      console.log('   6. Click "Create bucket"');
    }
    
    console.log('\n🎉 Supabase Storage setup looks good!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSupabaseStorage();
