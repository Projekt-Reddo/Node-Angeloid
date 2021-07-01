const fetch = require('node-fetch');
const Anime = require('../models/Anime');
const animeDAO = require('../daos/animeDAO');
const Character = require('../models/Character');
const { wait } = require('./wait');

exports.listAnimeBySeason = async (thisSeason) => {
    var arr = [];
    var count = 0;
    var data = await fetch(`https://api.jikan.moe/v3/season/${thisSeason}`);
    var json = await data.json();

    for (var anime of json.anime) {
        arr.push(anime.mal_id);

        count++;
        if (count == 39) {
            break;
        }
    }

    return arr;
};

exports.getAnimeInfoById = async (animeId, seasonDataStr) => {
    try {
        var animeData = await fetch(`https://api.jikan.moe/v3/anime/${animeId}`);
        var animeJson = await animeData.json();

        var thumbnail = await fetch(animeJson.image_url)
            .then(response => response.buffer())
            .then(response => Buffer.from(response, 'binary').toString('base64'));

        var characters = [];
        count = 0;

        await wait(5000);

        var charactersData = await fetch(`https://api.jikan.moe/v3/anime/${animeId}/characters_staff`);
        var charactersJson = await charactersData.json();

        if (charactersJson.characters.length !== 0) {
            for (var item of charactersJson.characters) {
                var vaName = "";
                var vaUrl = "";
                var vaImg = "";
                var charImg = "";
                var hasVA = false;

                if (item.voice_actors.length !== 0) {
                    for (var v of item.voice_actors) {
                        if (v.language === "Japanese") {
                            vaName = v.name;
                            vaUrl = v.image_url;
                            hasVA = true;
                        }
                    }
                }

                if (item.image_url != undefined) {
                    charImg = await fetch(item.image_url)
                        .then(response => response.buffer())
                        .then(response => Buffer.from(response, 'binary').toString('base64'));
                }

                if (hasVA) {
                    vaImg = await fetch(vaUrl)
                        .then(response => response.buffer())
                        .then(response => Buffer.from(response, 'binary').toString('base64'));
                }

                var character = new Character(
                    item.name.replace(',', ''),
                    item.role,
                    charImg,
                    vaName.replace(',', ''),
                    vaImg
                );
                characters.push(character);

                count++;
                if (count === 6) {
                    break;
                }
            }
        }

        if (animeJson.synopsis == undefined) {
            animeJson.synopsis = "";
        }

        var aired = "";
        if (animeJson.aired.string != null) {
            aired = animeJson.aired.string.split(" to ")[0];
        }

        var studioId = 9;
        if (animeJson.studios.length != 0) {
            studioId = animeJson.studios[0].mal_id;
        }

        var anime = new Anime(
            replaceQuote(animeJson.title),
            replaceQuote(animeJson.synopsis),
            thumbnail,
            animeJson.status,
            animeJson.trailer_url,
            0,
            animeJson.duration,
            animeJson.episodes,
            aired,
            animeJson.url,
            studioId,
            animeJson.genres,
            characters
        );

        // If there is no producer => set producer name to ''
        if (animeJson.producers.length === 0) {
            anime.studioId = 9;
        }

    await animeDAO.insertAnime(anime, seasonDataStr);
    } catch (err) {
        console.log(err);
    }
};

function replaceQuote(str) {
    return str.replace(/'/g,"''");
}