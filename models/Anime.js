class Anime {
    constructor(animeName, content, thumbnail, status, trailer, view, episodeDuration, episode, startDay, web, studioId, tags, characters) {
        this.animeName = animeName;
        this.content = content;
        this.thumbnail = thumbnail;
        this.status = status;
        this.trailer = trailer;
        this.view = view;
        this.episodeDuration = episodeDuration,
        this.episode = episode;
        this.startDay = startDay;
        this.web = web;
        this.studioId = studioId;
        this.tags = tags;
        this.characters = characters;
    }
}

module.exports = Anime;