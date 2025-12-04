export async function measurePerformance(testName: string): Promise<{ duration: number }> {
  const start = performance.now();

  // Simulate the operation being measured
  if (testName === 'task-loading') {
    await new Promise(resolve => setTimeout(resolve, 200));
  } else if (testName === 'authentication') {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const end = performance.now();
  return { duration: end - start };
}