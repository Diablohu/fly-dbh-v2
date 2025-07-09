export const folderNameSanityImagesCache = ".cache-assets/sanity-images";
export const folderNameLogs = ".logs";
export const adminTOTP = {
    intervalInSeconds: 30,
    digits: 6,
    key: new TextEncoder().encode(process.env.ADMIN_TOTP_KEY || ""),
};
export const adminLoginValidPeriod = 1000 * 60 * 60 * 24; // 24 hours
