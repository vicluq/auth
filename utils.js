// ! Simple Cookie Parser Midleware
exports.cookieParser = (req, res, next) => {
    const parsedCookies = {};

    if (req.get("Cookie")) {
        req
            .get("Cookie")
            .split("; ")
            .map((str) => str.split("="))
            .forEach(([key, value]) => {
                parsedCookies[key] = value;
            });
    }

    req.parsedCookies = parsedCookies;

    next();
}