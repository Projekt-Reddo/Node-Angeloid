class Anime {
    constructor(animeName, content, thumbnail, status, trailer, view, episodeDuration, episode, startday, web, studioId, tags, characters) {
        this.animeName = animeName;
        this.content = content;
        this.thumbnail = thumbnail;
        this.status = status;
        this.trailer = trailer;
        this.view = view;
        this.episodeDuration = episodeDuration,
        this.episode = episode;
        this.startday = startday;
        this.web = web;
        this.studioId = studioId;
        this.tags = tags;
        this.characters = characters;
    }
}

module.exports = Anime;