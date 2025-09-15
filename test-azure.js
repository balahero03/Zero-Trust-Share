/**
 * Azure Blob Storage Test Script
 * Run this to verify your Azure configuration
 */

const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');
require('dotenv').config({ path: '.env.local' });

async function testAzureSetup() {
  console.log('🔍 Testing Azure Blob Storage Configuration...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('AZURE_STORAGE_ACCOUNT_NAME:', process.env.AZURE_STORAGE_ACCOUNT_NAME ? '✅ Set' : '❌ Missing');
  console.log('AZURE_STORAGE_ACCOUNT_KEY:', process.env.AZURE_STORAGE_ACCOUNT_KEY ? '✅ Set' : '❌ Missing');
  console.log('AZURE_STORAGE_CONTAINER_NAME:', process.env.AZURE_STORAGE_CONTAINER_NAME || '❌ Missing');
  console.log('');

  if (!process.env.AZURE_STORAGE_ACCOUNT_NAME || !process.env.AZURE_STORAGE_ACCOUNT_KEY) {
    console.log('❌ Azure credentials are missing! Please check your .env.local file.');
    return;
  }

  try {
    // Initialize Azure Blob Storage client
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'aethervault-files';

    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      sharedKeyCredential
    );

    // Test connection by listing containers
    console.log('🔗 Testing Azure connection...');
    const containers = [];
    for await (const container of blobServiceClient.listContainers()) {
      containers.push(container.name);
    }
    
    console.log('✅ Azure connection successful!');
    console.log('📦 Available containers:');
    containers.forEach(container => {
      console.log(`   - ${container}`);
    });

    // Check if your container exists
    if (containerName) {
      const containerExists = containers.includes(containerName);
      if (containerExists) {
        console.log(`✅ Your container "${containerName}" exists!`);
        
        // Test container access
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const properties = await containerClient.getProperties();
        console.log(`📊 Container properties:`);
        console.log(`   - Created: ${properties.createdOn}`);
        console.log(`   - Last Modified: ${properties.lastModified}`);
        console.log(`   - Access Level: ${properties.publicAccess || 'Private'}`);
        
        // List some blobs (if any)
        const blobs = [];
        for await (const blob of containerClient.listBlobsFlat()) {
          blobs.push(blob.name);
        }
        
        if (blobs.length > 0) {
          console.log(`📁 Found ${blobs.length} blob(s):`);
          blobs.slice(0, 5).forEach(blob => {
            console.log(`   - ${blob}`);
          });
          if (blobs.length > 5) {
            console.log(`   ... and ${blobs.length - 5} more`);
          }
        } else {
          console.log('📁 Container is empty (no blobs found)');
        }
        
      } else {
        console.log(`❌ Your container "${containerName}" not found!`);
        console.log('   Please create the container in Azure Portal or run the setup script.');
      }
    }

    console.log('\n🎉 Azure setup looks good! You can now test file uploads.');

  } catch (error) {
    console.log('❌ Azure connection failed:');
    console.log('Error:', error.message);
    
    if (error.message.includes('AuthenticationFailed')) {
      console.log('\n💡 Solution: Check your AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCOUNT_KEY in .env.local');
    } else if (error.message.includes('AccountNotFound')) {
      console.log('\n💡 Solution: Check your AZURE_STORAGE_ACCOUNT_NAME in .env.local');
    } else if (error.message.includes('ContainerNotFound')) {
      console.log('\n💡 Solution: Create the container in Azure Portal or check the container name');
    } else if (error.message.includes('Forbidden')) {
      console.log('\n💡 Solution: Check your storage account key and permissions');
    }
  }
}

testAzureSetup();
