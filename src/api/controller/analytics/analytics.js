const { Url, ClickAnalysis, User } = require("../../../../models");
const { Op, Sequelize } = require("sequelize");

/**
 * Get analytics for a specific short URL
 */
exports.getUrlAnalytics = async (req, res) => {
  try {
    const { shortUrl } = req.params;
    console.log("irl =====================>", shortUrl);

    // Find the short URL
    const url = await Url.findOne({ where: { short_url: shortUrl } });
    if (!url) {
      return res.status(404).json({ message: "Short URL not found" });
    }

    // Total clicks
    const totalClicks = await ClickAnalysis.count({
      where: { short_url_id: url.id },
    });

    if (!totalClicks) {
      return res.status(404).json({ message: "totalClicks valuie is o" });
    }

    // Unique users (count distinct IPs)
    const uniqueUsers = await ClickAnalysis.count({
      where: { short_url_id: url.id },
      distinct: true,
      col: "ip_address",
    });

    // Clicks by Date (last 7 days)
    const clicksByDate = await ClickAnalysis.findAll({
      attributes: [
        [Sequelize.fn("DATE", Sequelize.col("clicked_at")), "date"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "clickCount"],
      ],
      where: {
        short_url_id: url.id,
        clicked_at: {
          [Op.gte]: Sequelize.literal("CURRENT_DATE - INTERVAL '7' DAY"),
        },
      },
      group: ["date"],
      order: [["date", "ASC"]],
    });

    // OS Type analytics
    const osType = await ClickAnalysis.findAll({
      attributes: [
        "os_type",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "uniqueClicks"],
      ],
      where: { short_url_id: url.id },
      group: ["os_type"],
    });

    // Device Type analytics
    const deviceType = await ClickAnalysis.findAll({
      attributes: [
        "device_type",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "uniqueClicks"],
      ],
      where: { short_url_id: url.id },
      group: ["device_type"],
    });

    res.json({ totalClicks, uniqueUsers, clicksByDate, osType, deviceType });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get analytics for a specific topic
 */
exports.getTopicAnalytics = async (req, res) => {
  try {
    const { topic } = req.params;

    // Find URLs under the topic
    const urls = await Url.findAll({ where: { topic } });

    if (!urls.length) {
      return res
        .status(404)
        .json({ message: "No URLs found under this topic" });
    }

    let totalClicks = 0;
    let uniqueUsers = new Set();
    let clicksByDate = {};

    const urlData = await Promise.all(
      urls.map(async (url) => {
        const clicks = await ClickAnalysis.count({
          where: { short_url_id: url.id },
        });
        const users = await ClickAnalysis.findAll({
          where: { short_url_id: url.id },
          attributes: ["ip_address"],
          group: ["ip_address"],
        });

        users.forEach((user) => uniqueUsers.add(user.ip_address));
        totalClicks += clicks;

        return {
          shortUrl: url.alias,
          totalClicks: clicks,
          uniqueUsers: users.length,
        };
      })
    );

    res.json({
      totalClicks,
      uniqueUsers: uniqueUsers.size,
      urls: urlData,
    });
  } catch (error) {
    console.error("Error fetching topic analytics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get overall analytics for the authenticated user
 */
exports.getOverallAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const urls = await Url.findAll({ where: { user_id: userId } });

    let totalClicks = 0;
    let uniqueUsers = new Set();
    let clicksByDate = {};

    const urlData = await Promise.all(
      urls.map(async (url) => {
        const clicks = await ClickAnalysis.count({
          where: { short_url_id: url.id },
        });

        const users = await ClickAnalysis.findAll({
          where: { short_url_id: url.id },
          attributes: ["ip_address"],
          group: ["ip_address"],
        });

        users.forEach((user) => uniqueUsers.add(user.ip_address));
        totalClicks += clicks;

        return {
          shortUrl: url.alias,
          totalClicks: clicks,
          uniqueUsers: users.length,
        };
      })
    );

    res.json({
      totalUrls: urls.length,
      totalClicks,
      uniqueUsers: uniqueUsers.size,
      urls: urlData,
    });
  } catch (error) {
    console.error("Error fetching overall analytics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
