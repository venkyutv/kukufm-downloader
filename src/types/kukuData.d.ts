export interface KukuData {
    id?:                number;
    title?:             string;
    slug?:              string;
    status?:            Status;
    image?:             string;
    original_image?:    string;
    duration_s?:        number;
    image_sizes?:       { [key: string]: string };
    n_likes?:           number;
    n_shares?:          number;
    n_plays?:           null;
    n_listens?:         number;
    n_comments?:        number;
    cover_type?:        CoverType;
    content?:           Content;
    dynamic_link?:      null | string;
    is_premium?:        boolean;
    is_play_locked?:    boolean;
    is_locked?:         boolean;
    is_fictional?:      boolean;
    index?:             number;
    show_id?:           number;
    season_no?:         number;
    is_demo_premium?:   boolean;
    media_size?:        number;
    published_on?:      Date;
    thumbnail_image?:   string;
    web_uri?:           string;
    view_type?:         ViewType;
    has_srt?:           boolean;
    has_liked?:         boolean;
    seek_position?:     number;
    season_index?:      number;
    season_n_episodes?: number;
    can_download?:      boolean;
    is_downloaded?:     boolean;
    is_self?:           boolean;
    transcript?:        Transcript;
    is_free_unlocked?:  boolean;
}

export interface Content {
    url?:               string;
    hls_url?:           string;
    premium_audio_url?: string;
}

export enum CoverType {
    Custom = "custom",
}

export enum Status {
    Live = "live",
}

export interface Transcript {
}

export enum ViewType {
    Default = "default",
}
