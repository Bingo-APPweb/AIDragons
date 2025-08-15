// Simple test to verify Jest is working
test('Jest is working', () => {
  expect(1 + 1).toBe(2);
});

test('Async test works', async () => {
  const result = await Promise.resolve('test');
  expect(result).toBe('test');
});
