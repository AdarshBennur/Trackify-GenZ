// Backend warmup utility
// Wakes up the backend server silently without waiting for response
export async function warmBackend(baseUrl) {
    try {
        fetch(`${baseUrl}/api/health`, {
            method: 'GET',
            cache: 'no-cache'
        }).catch(() => { });
    } catch (_) { }
}
