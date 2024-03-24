import generateReadmeHTML from "@/helpers/generate";
function isValidUsername(name: string) {
    if (name.length < 1 || /[^\-a-zA-Z0-9]/.test(name)) {
        return false;
    }
    return true;
}

function isValidUrl(url: string) {
    try {
        const u = new URL(url);
        return ["http:", "https:"].includes(u.protocol);
    } catch {
        return false;
    }
}

function isValidGenerateOption(obj: any) {
    if (typeof obj !== "object") {
        return false;
    }
    try {
        generateReadmeHTML(obj);
        return true;
    } catch {
        return false;
    }
}

export { isValidUsername, isValidUrl, isValidGenerateOption };
