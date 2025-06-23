// Test script to verify our normalization logic
const testNames = [
  'Richard Niger',
  'Richard  Niger', // extra space
  'richard niger', // lowercase
  'RICHARD NIGER', // uppercase
  'Richard Niger ', // trailing space
  ' Richard Niger', // leading space
];

const closerMap = new Map();

testNames.forEach((name, index) => {
  const closerName = name?.trim().replace(/\s+/g, ' ');
  const normalizedCloserKey = closerName?.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  console.log(`Original: "${name}" -> Cleaned: "${closerName}" -> Normalized: "${normalizedCloserKey}"`);
  
  if (!closerMap.has(normalizedCloserKey)) {
    closerMap.set(normalizedCloserKey, {
      name: closerName,
      count: 0
    });
  }
  
  const closer = closerMap.get(normalizedCloserKey);
  closer.count += 1;
});

console.log('\nFinal Map contents:');
console.log('Map size:', closerMap.size);
for (const [key, value] of closerMap.entries()) {
  console.log(`Key: "${key}" -> Name: "${value.name}", Count: ${value.count}`);
}
