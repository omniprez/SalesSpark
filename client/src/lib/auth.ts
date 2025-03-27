
export async function checkAuth() {
  try {
    const response = await fetch('/api/me');
    if (!response.ok) {
      throw new Error('Not authenticated');
    }
    return await response.json();
  } catch (error) {
    return null;
  }
}
