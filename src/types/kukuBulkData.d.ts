export interface KukuBulkData {
    show?:                        Show;
    reminder?:                    Reminder;
    episodes?:                    Episode[];
    has_more?:                    boolean;
    n_episodes?:                  number;
    n_pages?:                     number;
    page?:                        number;
    support_sticker?:             string;
    is_skip_show_page?:           boolean;
    season_n_episodes?:           number;
    last_unlocked_episode_index?: number;
    first_locked_episode_title?:  string;
    seo_description?:             string;
}

export interface Episode {
    id?:                number;
    title?:             string;
    slug?:              string;
    status?:            string;
    image?:             string;
    original_image?:    string;
    duration_s?:        number;
    image_sizes?:       { [key: string]: string };
    n_likes?:           number;
    n_shares?:          number;
    n_plays?:           null;
    n_listens?:         number;
    n_comments?:        number;
    cover_type?:        string;
    content?:           EpisodeContent;
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
    view_type?:         string;
    has_srt?:           boolean;
    has_liked?:         boolean;
    seek_position?:     number;
    season_index?:      number;
    season_n_episodes?: number;
    can_download?:      boolean;
    is_downloaded?:     boolean;
    is_self?:           boolean;
    transcript?:        GrowthEngineAudioCueInfo;
    is_free_unlocked?:  boolean;
}

export interface EpisodeContent {
    url?:               string;
    hls_url?:           string;
    premium_audio_url?: string;
}

export interface GrowthEngineAudioCueInfo {
}

export interface Reminder {
    default_time?:      string;
    calendar_event_id?: null;
    is_enabled?:        boolean;
    email?:             string;
    title?:             string;
    description?:       string;
    rrule?:             string;
    reminder_type?:     string;
}

export interface Show {
    id?:                           number;
    slug?:                         string;
    title?:                        string;
    image?:                        string;
    original_image?:               string;
    image_sizes?:                  { [key: string]: string };
    language?:                     string;
    published_on?:                 Date;
    created_on?:                   Date;
    seo_index?:                    boolean;
    status?:                       string;
    n_listens?:                    number;
    is_verified?:                  boolean;
    dynamic_link?:                 string;
    uri?:                          string;
    web_uri?:                      string;
    share_image_url?:              string;
    cover_type?:                   null;
    is_premium?:                   boolean;
    rss_url?:                      string;
    review_status?:                string;
    source?:                       string;
    overall_rating?:               number;
    n_reviews?:                    number;
    is_fictional?:                 boolean;
    duration_s?:                   number;
    n_episodes?:                   number;
    n_comments?:                   number;
    is_transcript_available?:      null;
    n_impressions?:                number;
    recommendation_score?:         number;
    users_completion_p?:           null;
    daily_unlock_count?:           number;
    thumbnail_color?:              string;
    is_daily_unlock_enabled?:      boolean;
    n_seasons?:                    number;
    is_coin_based?:                boolean;
    monetization_type?:            string;
    is_coin_premium?:              boolean;
    show_label_info?:              GrowthEngineAudioCueInfo;
    is_coming_soon?:               null;
    show_type?:                    string;
    is_comments_exposure_enabled?: boolean;
    is_adult_content?:             boolean;
    sharing_text?:                 string;
    sharing_text_v2?:              string;
    completion_status?:            number;
    description?:                  string;
    description_secondary?:        string;
    author?:                       Author;
    lang?:                         Lang;
    content_type?:                 ContentType;
    other_images?:                 OtherImages;
    thumbnail_data?:               GrowthEngineAudioCueInfo;
    meta_data?:                    MetaData;
    labels?:                       string[];
    is_top_10?:                    boolean;
    ever_been_vip_show?:           boolean;
    resume_episode?:               ResumeEpisode;
    is_self?:                      boolean;
    ad_enabled?:                   boolean;
    can_download_all?:             boolean;
    is_added?:                     boolean;
    genre?:                        Genre;
    credits?:                      Credits;
    media_size?:                   number;
    is_play_locked?:               boolean;
    hide_download_all_icon?:       null;
    last_unlocked_episode_index?:  number;
    first_locked_episode_title?:   string;
    growth_engine_audio_cue_info?: GrowthEngineAudioCueInfo;
    social_proofing?:              SocialProofing;
    physical_book_data?:           null;
    show_unlocked_nudge_text?:     string;
}

export interface Author {
    id?:                  number;
    name?:                string;
    avatar_cdn?:          string;
    original_avatar?:     string;
    avatar?:              { [key: string]: string };
    bio?:                 string;
    incognito_mode?:      boolean;
    badge_type?:          string;
    is_profile_complete?: boolean;
    dynamic_link?:        string;
    gender?:              string;
    has_premium?:         boolean;
    is_user_anonymous?:   boolean;
    is_suspended?:        boolean;
    is_phone_verified?:   boolean;
    is_email_verified?:   boolean;
    uuid?:                string;
}

export interface ContentType {
    id?:         number;
    title?:      string;
    slug?:       string;
    uri?:        string;
    web_uri?:    string;
    color_info?: ColorInfo;
    icon?:       string;
    svg_icon?:   string;
    icon_info?:  IconInfo;
    image_info?: ImageInfo;
}

export interface ColorInfo {
    bg_color?:   string;
    text_color?: string;
}

export interface IconInfo {
    svg_icon?:       string;
    gradient_end?:   string;
    section_icon?:   string;
    gradient_start?: string;
}

export interface ImageInfo {
    color?: string;
    image?: string;
    icon?:  string;
}

export interface Credits {
    quality_assurances?: Editor[];
    editors?:            Editor[];
    voice_artists?:      Editor[];
}

export interface Editor {
    id?:                number;
    full_name?:         string;
    avatar?:            { [key: string]: string };
    n_followers?:       number;
    contribution_type?: string;
    badge_type?:        string;
    is_followed?:       boolean;
}

export interface Genre {
    id?:      number;
    title?:   string;
    slug?:    string;
    uri?:     string;
    web_uri?: string;
}

export interface Lang {
    id?:              number;
    title?:           string;
    title_secondary?: string;
    image?:           string;
    slug?:            string;
    color?:           string;
    uri?:             string;
    web_uri?:         string;
    color_info?:      ColorInfo;
    short_title?:     string;
    svg_icon?:        string;
    icon_sizes?:      { [key: string]: string };
}

export interface MetaData {
    id?:                   number;
    is_bgm_available?:     boolean;
    indian_context?:       string;
    creator_type?:         string;
    vo_type?:              string;
    content_format?:       string;
    ip_source?:            string;
    episode_one_format?:   string;
    request_origins?:      string[];
    original_formats?:     string[];
    author_nationality?:   any[];
    original_language?:    any[];
    accent_type?:          null;
    AI_driven_operations?: any[];
    is_show_relaunch?:     boolean;
    show_concept_note?:    null;
    age_rating?:           string;
    n_unlocked_episodes?:  number;
}

export interface OtherImages {
    landscape_image?:                string;
    landscape_image_sizes?:          { [key: string]: string };
    vertical_thumbnail?:             null;
    vertical_thumbnail_image_sizes?: { [key: string]: string };
}

export interface ResumeEpisode {
    id?:              number;
    title?:           string;
    slug?:            string;
    status?:          string;
    image?:           string;
    original_image?:  string;
    duration_s?:      number;
    image_sizes?:     { [key: string]: string };
    n_likes?:         number;
    n_shares?:        number;
    n_plays?:         number;
    n_listens?:       number;
    n_comments?:      number;
    cover_type?:      string;
    content?:         ResumeEpisodeContent;
    dynamic_link?:    string;
    is_premium?:      boolean;
    is_play_locked?:  boolean;
    is_locked?:       boolean;
    is_fictional?:    boolean;
    index?:           number;
    show_id?:         number;
    season_no?:       number;
    is_demo_premium?: boolean;
    media_size?:      number;
    published_on?:    Date;
    thumbnail_image?: string;
    is_completed?:    boolean;
    seek_position?:   number;
}

export interface ResumeEpisodeContent {
    url?:     string;
    hls_url?: string;
}

export interface SocialProofing {
    review?: Review;
}

export interface Review {
    pinned_review_rating?: string;
    rating?:               number;
    user_id?:              number;
    user_name?:            string;
    user_avatar?:          string;
}
