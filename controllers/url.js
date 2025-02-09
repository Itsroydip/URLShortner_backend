const Url = require("../schemas/url.schema");
const User = require("../schemas/user.schema");
const shortid = require('shortid');

const handleCreateUrl = async (req, res) => {
    try {
        const { redirectUrl, remarks, expiration } = req.body;
        const isUrlExist = await Url.findOne({redirectUrl});
        if(isUrlExist){
            return res.status(400).json({message: "Url already exists"});
        }        

        const user = await User.findOne({email: req.user.email});
        const userId = user._id;
        const shortId = shortid();
        const expirationDate = expiration ? new Date(expiration) : null;
        const url = new Url({
            shortId,
            redirectUrl,
            remarks,
            expiration: expirationDate,
            userId
        });
        console.log(url)
        await url.save();
        res.status(200).json({
            message: "Url created successfully",
            shortId
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Server error"
        });
    }
};


const handleFetchUrl = async (req, res) => {
    let { page, pageSize } = req.query;

    try {
        page = parseInt(page, 10) || 1;
        pageSize = parseInt(pageSize, 10) || 50;

        const user = await User.findOne({email: req.user.email});
        const userId = user._id;
        const totalCount = await Url.find({userId});
        const urls = await Url.find({userId})
            .limit(pageSize)
            .skip((page - 1) * pageSize);

        res.status(200).json({ 
            totalCount: totalCount.length,
            data: urls
        });

    } catch (error) {
        console.log(error); 
        res.status(500).json({
            message: "Server error"
        });
    }

}


const handleEditUrl = async (req, res) => {
    try {
        const { id } = req.params;
        const { redirectUrl, remarks, expiration } = req.body;
        const url = await Url.findById(id);
        if (!url) {
            return res.status(400).json({ message: "Url not found" });
        }

        url.redirectUrl = redirectUrl;
        url.remarks = remarks;
        url.expiration = expiration;
        await url.save();
        res.status(200).json({ message: "Url updated successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server error"
        });
    }
}


const handleDeleteUrl = async (req, res) => {
    try {
        const { id } = req.params;
        const url = await Url.findById(id);
        if (!url) {
            return res.status(400).json({ message: "Url not found" });
        }
        await url.deleteOne({ _id: id });
        res.status(200).json({ message: "Url deleted successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server error"
        });
    }
}

const handleAnalytics = async (req,res) => {

    try {
        const user = await User.findOne({email: req.user.email});
        const analyticsData = await Url.aggregate([
            // Unwind the visitHistory array
            {$match: { 
                userId: user._id,
              }}, 

            { $unwind: "$visitHistory" },
    
            // Project only the fields we need
            {
              $project: {
                timestamp: "$visitHistory.timestamp",
                originalLink: "$redirectUrl",
                shortId: "$shortId",
                ipAddress: "$visitHistory.ip",
                userDevice: "$visitHistory.device",
              },
            },
    
            // Sort by timestamp in descending order
            { $sort: { timestamp: -1 } },
    
            // Limit to 1000 results (adjust as needed)
            { $limit: 1000 },
          ])
          
        

        res.status(200).json({ 
            analyticsData
        });

    } catch (error) {
        console.log(error); 
        res.status(500).json({
            message: "Server error"
        });
    }

}

const handleClickData = async (req,res) => {
    const currentDate = new Date().getTime();
    const oneYearAgo =currentDate - (24*60*60*1000*365);

    try{
        const startDate = oneYearAgo;
        const endDate = currentDate;

        const user = await User.findOne({email: req.user.email});


        // Prepare date range filter
        const dateFilter = {}
        if (startDate) {
        dateFilter.$gte = startDate
        }
        if (endDate) {
        dateFilter.$lte = endDate
        }

        console.log(dateFilter)

        const dateWiseClicks = await Url.aggregate([
            { $match: { userId: user._id } },
      { $unwind: "$visitHistory" },
      {
        $match: {
          "visitHistory.timestamp": dateFilter,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$visitHistory.timestamp" } },
          },
          dailyClicks: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $group: {
          _id: null,
          dates: {
            $push: {
              date: "$_id",
              dailyClicks: "$dailyClicks",
            },
          },
          totalClicks: { $sum: "$dailyClicks" },
        },
      },
      {
        $project: {
          _id: 0,
          data: {
            $map: {
              input: {
                $range: [0, { $size: "$dates" }],
              },
              as: "index",
              in: {
                date: { $arrayElemAt: ["$dates.date", "$$index"] },
                clicks: {
                  $sum: {
                    $slice: ["$dates.dailyClicks", { $add: ["$$index", 1] }],
                  },
                },
              },
            },
          },
        },
      },
      { $unwind: "$data" },
      { $replaceRoot: { newRoot: "$data" } },
      { $sort: { date: -1 } },
          ])

        res.status(200).json(
            dateWiseClicks
        );


    }catch (error) {
        console.log(error); 
        res.status(500).json({
            message: "Server error"
        });
    }
    

}

const handleDeviceInfo = async (req,res) => {
    const currentDate = new Date().getTime();
    const oneYearAgo =currentDate - (24*60*60*1000*365);

    try{
        const startDate = oneYearAgo;
        const endDate = currentDate;

        const user = await User.findOne({email: req.user.email});


        // Prepare date range filter
        const dateFilter = {}
        if (startDate) {
        dateFilter.$gte = startDate
        }
        if (endDate) {
        dateFilter.$lte = endDate
        }

        console.log(dateFilter)

      
        const deviceClicks = await Url.aggregate([

            { $match: { userId: user._id } },
            { $unwind: "$visitHistory" },
            {
              $match: {
                "visitHistory.timestamp": dateFilter,
              },
            },
            {
              $group: {
                _id: {
                  $switch: {
                    branches: [
                      { case: { $regexMatch: { input: "$visitHistory.device", regex: /desktop/i } }, then: "Desktop" },
                      {
                        case: { $regexMatch: { input: "$visitHistory.device", regex: /mobile|android|iphone/i } },
                        then: "Mobile",
                      },
                      { case: { $regexMatch: { input: "$visitHistory.device", regex: /tablet|ipad/i } }, then: "Tablet" },
                    ],
                    default: "Others",
                  },
                },
                clicks: { $sum: 1 },
              },
            },
            {
              $group: {
                _id: null,
                totalClicks: { $sum: "$clicks" },
                devices: { $push: { device: "$_id", clicks: "$clicks" } },
              },
            },
            {
              $project: {
                _id: 0,
                totalClicks: 1,
                devices: {
                  $map: {
                    input: "$devices",
                    as: "device",
                    in: {
                      device: "$$device.device",
                      clicks: "$$device.clicks",
                      percentage: {
                        $round: [{ $multiply: [{ $divide: ["$$device.clicks", "$totalClicks"] }, 100] }, 2],
                      },
                    },
                  },
                },
              },
            },
          ])

        res.status(200).json(
            deviceClicks
        );


    }catch (error) {
        console.log(error); 
        res.status(500).json({
            message: "Server error"
        });
    }
    

}

module.exports = {
    handleCreateUrl,
    handleFetchUrl,
    handleEditUrl,
    handleDeleteUrl,
    handleAnalytics,
    handleClickData,
    handleDeviceInfo
}