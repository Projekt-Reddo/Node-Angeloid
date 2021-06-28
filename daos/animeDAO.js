const config = require('../db/dbConfig');
const sql = require('mssql');

exports.insertAnime = (anime, seasonData) => {
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
                declare @str varchar(max) = '${anime.thumbnail}';
                INSERT INTO Animes (AnimeName, Content, Thumbnail, Status, Trailer, "View", EpisodeDuration, Episode, StartDay, Web, StudioId, SeasonId)
                OUTPUT Inserted.AnimeId  
                SELECT '${anime.animeName}', '${anime.content}', cast(N'' as xml).value('xs:base64Binary(sql:variable("@str"))', 'varbinary(MAX)'), '${anime.status}', '${anime.trailer}', 0, '${anime.episodeDuration}', '${anime.episode}', '${anime.startDay}', '${anime.web}', ${anime.studioId}, SeasonId FROM dbo.Seasons WHERE CONCAT(SeasonName, ' ', Year) = '${seasonData}'; 
            `;
            // Insert Tags
            for (let tag of anime.tags) {
                query += `INSERT INTO AnimeTags (TagId, AnimeId) SELECT ${tag.mal_id}, AnimeId FROM dbo.Animes WHERE AnimeName = '${replaceQuote(anime.animeName)}'; `;
            }

            const request = new sql.Request(transaction)
            request.query(query, (err, rs) => {
                if (err) {
                    if (!rolledBack) {
                        transaction.rollback(err => {
                            // console.log(err);
                        })
                    }
                } else {
                    transaction.commit(err => {
                        // console.log(err);
                        // console.log(rs);
                        if (rs.recordset[0].AnimeId != undefined) {
                            var animeId = rs.recordset[0].AnimeId;
                            if (anime.characters.length != 0) {
                                for (var item of anime.characters) {
                                    var newQuery;
                                    if (item.seiyuuName == undefined) {
                                        newQuery = `
                                            declare @charImg varchar(max) = '${item.characterImage}';
                                            INSERT INTO Characters (CharacterName, CharacterRole, CharacterImage, SeiyuuId) VALUES ('${item.characterName}', '${item.characterRole}', cast(N'' as xml).value('xs:base64Binary(sql:variable("@charImg"))', 'varbinary(MAX)'), 1)
                                        `;
                                    } else {
                                        newQuery = `
                                            IF NOT EXISTS (SELECT * FROM dbo.Seiyuus WHERE SeiyuuName = '${item.seiyuuName}')
                                            BEGIN
                                            declare @seiyuuImg varchar(max) = '${item.seiyuuImage}';
                                            INSERT INTO dbo.Seiyuus (SeiyuuName, SeiyuuImage) VALUES ('${item.seiyuuName}', cast(N'' as xml).value('xs:base64Binary(sql:variable("@seiyuuImg"))', 'varbinary(MAX)'));
                                            END
                                            declare @charImg varchar(max) = '${item.characterImage}';
                                            INSERT INTO dbo.Characters (CharacterName, CharacterRole, CharacterImage, AnimeId, SeiyuuId) SELECT '${item.characterName}', '${item.characterRole}', cast(N'' as xml).value('xs:base64Binary(sql:variable("@charImg"))', 'varbinary(MAX)'), ${animeId}, SeiyuuId FROM dbo.Seiyuus WHERE SeiyuuName = '${item.seiyuuName}';
                                        `;

                                        const re = new sql.Request();
                                        re.query(newQuery, (err, rs) => {
                                            if (err) {
                                                console.log(err);
                                            }
                                            console.log(rs);
                                        });
                                    }
                                }
                            }
                        }
                    })
                }
            });
        })
    })
}

function replaceQuote(str) {
    return str.replace(/'/g,"''");
}