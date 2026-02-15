const User = require("../models/user");

module.exports.toggleBookmark = async (req, res) => {
    const { id } = req.params;   // listing id
    const user = await User.findById(req.user._id);

    const isBookmarked = user.bookmarks.includes(id);

    if (isBookmarked) {
        user.bookmarks.pull(id);
    } else {
        user.bookmarks.push(id);
    }

    await user.save();

    res.json({
        bookmarked: !isBookmarked
    });
};
