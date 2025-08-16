// Simple test to verify Jest is working
const sum = (a, b) => a + b;

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});

test('object assignment', () => {
  const data = { one: 1 };
  data['two'] = 2;
  expect(data).toEqual({ one: 1, two: 2 });
});

test('async test', async () => {
  const fetchData = () => Promise.resolve('peanut butter');
  const data = await fetchData();
  expect(data).toBe('peanut butter');
});
