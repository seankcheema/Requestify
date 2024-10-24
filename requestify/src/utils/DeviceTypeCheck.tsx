//checks the device type for which page to load
export const mobileOrDesktop = (): boolean => {
    const userAgent = navigator.userAgent.toLowerCase();
    return /android|iphone|ipad|windows phone|mobile/i.test(userAgent);
};

