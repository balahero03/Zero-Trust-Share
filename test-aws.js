/**
 * AWS S3 Test Script
 * Run this to verify your AWS configuration
 */

const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: '.env.local' });

async function testAWSSetup() {
  console.log('🔍 Testing AWS S3 Configuration...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing');
  console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing');
  console.log('AWS_S3_REGION:', process.env.AWS_S3_REGION || '❌ Missing');
  console.log('AWS_S3_BUCKET_NAME:', process.env.AWS_S3_BUCKET_NAME || '❌ Missing');
  console.log('');

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.log('❌ AWS credentials are missing! Please check your .env.local file.');
    return;
  }

  try {
    // Initialize S3 client
    const s3Client = new S3Client({
      region: process.env.AWS_S3_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    // Test connection by listing buckets
    console.log('🔗 Testing AWS connection...');
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    
    console.log('✅ AWS connection successful!');
    console.log('📦 Available buckets:');
    response.Buckets.forEach(bucket => {
      console.log(`   - ${bucket.Name} (created: ${bucket.CreationDate})`);
    });

    // Check if your bucket exists
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (bucketName) {
      const bucketExists = response.Buckets.some(bucket => bucket.Name === bucketName);
      if (bucketExists) {
        console.log(`✅ Your bucket "${bucketName}" exists!`);
      } else {
        console.log(`❌ Your bucket "${bucketName}" not found!`);
        console.log('   Please create the bucket in AWS S3 console.');
      }
    }

    console.log('\n🎉 AWS setup looks good! You can now test file uploads.');

  } catch (error) {
    console.log('❌ AWS connection failed:');
    console.log('Error:', error.message);
    
    if (error.name === 'InvalidAccessKeyId') {
      console.log('\n💡 Solution: Check your AWS_ACCESS_KEY_ID in .env.local');
    } else if (error.name === 'SignatureDoesNotMatch') {
      console.log('\n💡 Solution: Check your AWS_SECRET_ACCESS_KEY in .env.local');
    } else if (error.name === 'NoSuchBucket') {
      console.log('\n💡 Solution: Create the S3 bucket in AWS console');
    }
  }
}

testAWSSetup();
