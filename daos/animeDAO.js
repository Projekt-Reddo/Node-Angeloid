const config = require('../db/dbConfig');
const sql = require('mssql');

exports.insertAnime = (anime, seasonData) => {
    // If there is no producer => set producer name to ''
    if (anime.producers.length === 0) {
        anime.producers = [
            { mal_id: 9 }
        ];
    }

    // Connect DB
    sql.connect(config, (err) => {
        // Err
        if (err) console.log(err);

        // Transaction
        const transaction = new sql.Transaction();
        transaction.begin(err => {
            let rolledBack = false
            transaction.on('rollback', aborted => {
                // emited with aborted === true
                rolledBack = true;
            });
        
            // Insert Anime query
            var query = `
                INSERT INTO Animes (AnimeName, Content, Status, "View", StudioId, SeasonId) SELECT '${replaceQuote(anime.title)}', '${replaceQuote(anime.synopsis)}', 'Not Aired', 0, ${anime.producers[0].mal_id}, SeasonId FROM dbo.Seasons WHERE CONCAT(SeasonName, ' ', Year) = '${seasonData}'; 
            `;
            // Insert Tags
            for (let genre of anime.genres) {
                query += `INSERT INTO AnimeTags (TagId, AnimeId) SELECT ${genre.mal_id}, AnimeId FROM dbo.Animes WHERE AnimeName = '${replaceQuote(anime.title)}'; `;
            }

            const request = new sql.Request(transaction)
            request.query(query, (err, rs) => {
                if (err) {
                    if (!rolledBack) {
                        transaction.rollback(err => {
                            console.log(err);
                        })
                    }
                } else {
                    transaction.commit(err => {
                        console.log(rs);
                        console.log(err);
                    })
                }
            });
        })
    })
}

function replaceQuote(str) {
    return str.replace(/'/g,"''");
}