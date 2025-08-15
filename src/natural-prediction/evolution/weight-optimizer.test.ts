import { defaultWeightOptimizer } from './weight-optimizer';
test('WeightOptimizer loads', () => {
  expect(defaultWeightOptimizer).toBeTruthy();
});
