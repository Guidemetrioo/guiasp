const fs = require('fs');
const path = require('path');

const videosDir = path.join(__dirname, '..', 'public', 'videos');
const outputFile = path.join(__dirname, '..', 'lib', 'videos-list.json');

try {
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
  }
  const files = fs.readdirSync(videosDir);
  const mp4Files = files.filter(f => f.toLowerCase().endsWith('.mp4'));
  fs.writeFileSync(outputFile, JSON.stringify(mp4Files, null, 2));
  console.log(`Successfully generated video list with ${mp4Files.length} videos at ${outputFile}`);
} catch (error) {
  console.error('Error generating videos list:', error);
  process.exit(1);
}
