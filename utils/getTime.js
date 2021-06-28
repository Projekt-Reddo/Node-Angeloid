// Get this season base on real time
exports.getThisSeason = () => {
    var d = new Date();
    var month = parseInt(d.getMonth());
    var season = getSeasonName(month);
    var year = d.getFullYear();
    return `${year}/${season}`
}

// Get season name based on month
const getSeasonName = (month) => {
    if (0 <= month && month <= 2) { return 'winter'; }
    if (3 <= month && month <= 5) { return 'spring'; }
    if (6 <= month && month <= 8) { return 'summer'; }
    return 'fall';
}