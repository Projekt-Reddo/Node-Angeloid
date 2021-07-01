const animeDAO = require('../daos/animeDAO');
const timeHelper = require('../utils/getTime');
const api = require('../utils/callAPI');
const { wait } = require('../utils/wait');

var isProcessing = false;

exports.processing = async (req, res) => {
    try {
        if (isProcessing) {
            res.json(true);
        } else {
            res.json(false);
        }
    } catch (err) {
        console.log(err);
    }
}


exports.getLater = async (req, res) => {
    try {
        if (isProcessing) {
            res.json("Processing!");
        }

        console.log("Processing...")
        isProcessing = true;
        var thisSeason = timeHelper.getThisSeason();
        var seasonData = thisSeason.split('/');
        var seasonDataStr = seasonData[1].charAt(0).toUpperCase() + seasonData[1].slice(1) + " " + seasonData[0];

        var arr = await api.listAnimeBySeason(thisSeason);
        await handleInsertAnime(arr, seasonDataStr);
        
        console.log("DONE!");
        isProcessing = false;
        res.json("Done!");
    } catch (err) {
        console.log(err);
    }
}

async function handleInsertAnime(arr, seasonDataStr) {
    count = 0;
    for (var animeId of arr) {
        await wait(5000); 
        await api.getAnimeInfoById(animeId, seasonDataStr);
        count++;
        console.log(count);
    }
} 