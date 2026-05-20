import { useEffect } from 'react';

/**
 * Custom hook to update document title
 * @param {string} title - The title to set for the document
 * @param {string} appName - The application name to append (default: 'STP Investments')
 */
const useDocumentTitle = (title, appName = 'STP Investments') => {
    useEffect(() => {
        if (title) {
            document.title = `${title} - ${appName}`;
        } else {
            document.title = appName;
        }

        // Cleanup function to reset title when component unmounts
        return () => {
            document.title = appName;
        };
    }, [title, appName]);
};

export default useDocumentTitle;
