/**
 * Test Upload/Download Functionality
 * This script tests the complete upload/download flow
 */

const { createClient } = require('@supabase/supabase-js');

// Use the hardcoded credentials
const supabaseUrl = "https://gbjvlaboflhkvlbkuram.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdianZsYWJvZmxoa3ZsYmt1cmFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzkxMiwiZXhwIjoyMDczNDgzOTEyfQ.Qi4jY72suoAP1kgGd6mEuTp8aoOjRTNgityFFNSxO3Q";

console.log('🧪 Testing Upload/Download Functionality...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUploadDownload() {
  try {
    // Test 1: Create a test file
    console.log('1. Creating test file...');
    const testContent = 'Hello, this is a test file for Zero-Trust-Share!';
    const testFile = new Blob([testContent], { type: 'text/plain' });
    const testFileName = `test-${Date.now()}.txt`;
    
    console.log(`   Test file: ${testFileName}`);
    console.log(`   Size: ${testFile.size} bytes`);
    
    // Test 2: Upload to Supabase Storage
    console.log('2. Uploading to Supabase Storage...');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('aethervault-files')
      .upload(testFileName, testFile, {
        contentType: 'text/plain',
        upsert: false
      });
    
    if (uploadError) {
      console.log('❌ Upload failed:', uploadError.message);
      return;
    }
    
    console.log('✅ Upload successful!');
    console.log(`   Path: ${uploadData.path}`);
    
    // Test 3: Download from Supabase Storage
    console.log('3. Downloading from Supabase Storage...');
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('aethervault-files')
      .download(testFileName);
    
    if (downloadError) {
      console.log('❌ Download failed:', downloadError.message);
      return;
    }
    
    console.log('✅ Download successful!');
    
    // Test 4: Verify content
    console.log('4. Verifying content...');
    const downloadedContent = await downloadData.text();
    
    if (downloadedContent === testContent) {
      console.log('✅ Content verification successful!');
      console.log(`   Original: "${testContent}"`);
      console.log(`   Downloaded: "${downloadedContent}"`);
    } else {
      console.log('❌ Content verification failed!');
      console.log(`   Original: "${testContent}"`);
      console.log(`   Downloaded: "${downloadedContent}"`);
    }
    
    // Test 5: Clean up
    console.log('5. Cleaning up test file...');
    const { error: deleteError } = await supabase.storage
      .from('aethervault-files')
      .remove([testFileName]);
    
    if (deleteError) {
      console.log('⚠️  Cleanup failed:', deleteError.message);
    } else {
      console.log('✅ Cleanup successful!');
    }
    
    console.log('\n🎉 Upload/Download test completed successfully!');
    console.log('Your Supabase Storage is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUploadDownload();
