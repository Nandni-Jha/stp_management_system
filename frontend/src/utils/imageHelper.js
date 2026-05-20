/**
 * Helper function to get full image URL
 * Converts relative image paths to absolute URLs
 *
 * @param {string} imagePath - The image path (relative or absolute)
 * @returns {string|null} - Full image URL or null if no path provided
 */
export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // If already a full URL, return as is
    if (imagePath.startsWith('http')) return imagePath;

    // Get base URL from environment or use default
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;

    return `${cleanBase}/${cleanPath}`;
};
