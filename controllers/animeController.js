const fetch = require('node-fetch');
const animeDAO = require('../daos/animeDAO');

exports.getLater = async (req, res) => {
    try {
        var thisSeason = getThisSeason();
        var seasonData = thisSeason.split('/');
        var seasonDataStr = seasonData[1].charAt(0).toUpperCase() + seasonData[1].slice(1) + " " + seasonData[0];
        fetch(`https://api.jikan.moe/v3/season/${thisSeason}`)
            .then(response => response.json())
            .then(async json => {
                for (var anime of json.anime) {
                    animeDAO.insertAnime(anime, seasonDataStr);
                    // Prevent too much connect to DB
                    await wait(500);
                }
            })
            .then(rs => res.json("Done!"));
    } catch (err) {
        console.log(err);
    }
}

// Get this season base on real time
function getThisSeason() {
    var d = new Date();
    var month = parseInt(d.getMonth());
    var season = getSeason(month);
    var year = d.getFullYear();
    return `${year}/${season}`
}

// Get season name based on month
function getSeason(month) {
    if (0 <= month && month <= 2) { return 'winter'; }
    if (3 <= month && month <= 5) { return 'spring'; }
    if (6 <= month && month <= 8) { return 'summer'; }
    return 'fall';
}

// Handle wait
function wait(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}