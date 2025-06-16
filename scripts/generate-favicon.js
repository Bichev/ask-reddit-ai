#!/usr/bin/env node

/**
 * Favicon Generator Script for Ask Reddit AI
 * 
 * This script generates various favicon formats from the SVG source
 * Run with: node scripts/generate-favicon.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available (optional dependency)
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.log('Sharp not found. Install with: npm install sharp --save-dev');
  console.log('For now, you can use online converters to generate favicons.');
  process.exit(1);
}

const svgPath = path.join(__dirname, '../public/favicon.svg');
const publicDir = path.join(__dirname, '../public');

async function generateFavicons() {
  try {
    console.log('🎨 Generating favicons for Ask Reddit AI...');

    // Read the SVG file
    const svgBuffer = fs.readFileSync(svgPath);

    // Generate different sizes
    const sizes = [
      { size: 16, name: 'favicon-16x16.png' },
      { size: 32, name: 'favicon-32x32.png' },
      { size: 48, name: 'favicon-48x48.png' },
      { size: 180, name: 'apple-touch-icon.png' },
      { size: 192, name: 'android-chrome-192x192.png' },
      { size: 512, name: 'android-chrome-512x512.png' },
    ];

    // Generate PNG files
    for (const { size, name } of sizes) {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(publicDir, name));
      
      console.log(`✅ Generated ${name} (${size}x${size})`);
    }

    // Generate ICO file (16x16 and 32x32)
    const ico16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
    const ico32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
    
    // For ICO generation, we'll create a simple 32x32 PNG and rename it
    // (Most modern browsers support PNG favicons)
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon.ico'));
    
    console.log('✅ Generated favicon.ico (32x32)');

    // Generate web app manifest
    const manifest = {
      name: "Ask Reddit AI",
      short_name: "Ask Reddit AI",
      description: "AI-powered answers from Reddit discussions",
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#4F46E5",
      icons: [
        {
          src: "/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png"
        }
      ]
    };

    fs.writeFileSync(
      path.join(publicDir, 'site.webmanifest'),
      JSON.stringify(manifest, null, 2)
    );

    console.log('✅ Generated site.webmanifest');
    console.log('🎉 All favicons generated successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Add favicon links to your layout.tsx');
    console.log('2. Test the favicons in different browsers');
    console.log('3. Deploy to see them in action!');

  } catch (error) {
    console.error('❌ Error generating favicons:', error);
    process.exit(1);
  }
}

// Run the generator
generateFavicons(); 