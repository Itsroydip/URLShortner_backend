const Url = require("../schemas/url.schema");
const User = require("../schemas/user.schema");
const DeviceDetector = require("device-detector-js");

const handleRedirect = async (req, res) => {
    try {
        const { shortid } = req.params;
        const deviceDetector = new DeviceDetector();
        const userAgent = req.get('User-Agent');
        const device = deviceDetector.parse(userAgent);

        const url = await Url.findOneAndUpdate(
            { shortId: shortid },
            {
                $push: {
                    visitHistory: {
                        timestamp: Date.now(),
                        ip: req.headers["x-forwarded-for"] || 
                            req.headers["x-real-ip"] || 
                            req.connection.remoteAddress || 
                            req.socket.remoteAddress ||
                            req.connection.socket.remoteAddress,                        
                        device: device.device.type
                    }
                }
            }
        );

        if (!url) {
            return res.status(400).json({ message: "Url not found" });
        }
 
        if (url.expiration && new Date(url.expiration) < Date.now()) {
            return res.status(410).json({ message: "Url has expired" });
        }

        res.redirect(url.redirectUrl);       

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
}

module.exports = handleRedirect;
