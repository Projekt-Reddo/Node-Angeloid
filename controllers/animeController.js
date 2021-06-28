const animeDAO = require('../daos/animeDAO');
const timeHelper = require('../utils/getTime');
const api = require('../utils/callAPI');
const { wait } = require('../utils/wait');

exports.getLater = async (req, res) => {
    try {
        var thisSeason = timeHelper.getThisSeason();
        var seasonData = thisSeason.split('/');
        var seasonDataStr = seasonData[1].charAt(0).toUpperCase() + seasonData[1].slice(1) + " " + seasonData[0];

        var arr = await api.listAnimeBySeason(thisSeason);
        await handleInsertAnime(arr, seasonDataStr);
        res.json("Done!");
    } catch (err) {
        console.log(err);
    }
}

async function handleInsertAnime(arr, seasonDataStr) {
    for (var animeId of arr) {
        await wait(5000); 
        await api.getAnimeInfoById(animeId, seasonDataStr);
    }
} 