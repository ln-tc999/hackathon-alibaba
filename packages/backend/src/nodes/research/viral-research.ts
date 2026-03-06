import fs from 'fs';
import path from 'path';

interface SearchResult {
  relevantTopics: string[];
  suggestedTitles: string[];
  recommendedReferences: string[];
  hashtags: string[];
  insights: string;
}

class ViralContentResearch {
  private data: any;

  constructor() {
    const dataPath = path.join(__dirname, '../../../data/viral_content_research.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    this.data = JSON.parse(rawData);
  }

  buildContextForQwen(query: string): string {
    const result = this.searchViralContent(query);

    return `VIRAL CONTENT RESEARCH CONTEXT for query "${query}":

RELEVANT TOPICS:
${result.relevantTopics.map((t) => `- ${t}`).join('\n')}

SUGGESTED TITLES:
${result.suggestedTitles.map((t) => `- ${t}`).join('\n')}

TRENDING REFERENCES:
${result.recommendedReferences.map((r) => `- ${r}`).join('\n')}

HASHTAGS:
${result.hashtags.map((h) => `#${h}`).join(' ')}

INSIGHTS:
${result.insights}

Use this research to enhance the user's prompt with viral content trends.`;
  }

  isViralQuery(query: string): boolean {
    const viralKeywords = [
      'viral',
      'trending',
      'konten',
      'search',
      'lucu',
      'funny',
      'comedy',
      'love',
      'emotional',
      'news',
      'berita',
      'meme',
      'product',
      'digital',
      'fyp',
      'foryou',
      'hot',
      'most',
      'indonesia',
      'worldwide',
      'dance',
      'challenge',
      'sport',
      'football',
      'gadget',
      'tech',
    ];
    const queryLower = query.toLowerCase();
    return viralKeywords.some((keyword) => queryLower.includes(keyword));
  }

  searchViralContent(query: string): SearchResult {
    const queryLower = query.toLowerCase();
    const isIndonesia =
      queryLower.includes('indonesia') ||
      queryLower.includes(' id') ||
      queryLower.includes('donesia') ||
      queryLower.includes(' aceh') ||
      queryLower.includes(' jakarta');
    const isWorldwide =
      queryLower.includes('worldwide') ||
      queryLower.includes('global') ||
      queryLower.includes('dunia') ||
      queryLower.includes('international') ||
      queryLower.includes('america') ||
      queryLower.includes('europe');

    let relevantTopics: string[] = [];
    let suggestedTitles: string[] = [];
    let recommendedReferences: string[] = [];
    let hashtags: string[] = [];
    let insights: string = '';

    const region = isIndonesia
      ? this.data.indonesia
      : isWorldwide
        ? this.data.worldwide
        : this.data.indonesia;
    const period = isIndonesia
      ? this.data.indonesia.period
      : isWorldwide
        ? this.data.worldwide.period
        : 'Indonesia & Worldwide';

    if (
      queryLower.includes('love') ||
      queryLower.includes('emotional') ||
      queryLower.includes('hopecore')
    ) {
      relevantTopics = ['love', 'emotional', 'hopecore', 'personal story', 'transformation'];
      suggestedTitles = isIndonesia
        ? ['the beauty of real love ♥️', 'Heartbreaking 🦺', 'transformasi 1 tahun - motivasi']
        : ['the beauty of real love ♥️', 'Heartbreaking 🦺', 'transformation story'];
      recommendedReferences = [
        'When I look at Grammy - vidz',
        'Jacob and the Stone SLOWED - ssxmusic',
        'What Was I Made For? - Mark Ronson',
      ];
      hashtags = ['love', 'hopecore', 'foryou', 'fyp', 'viral', 'emotional'];
      insights = `Emotional content performs best with personal stories, transformation, or heartfelt moments. Use slow-motion music and emotional hooks.`;
    } else if (queryLower.includes('news') || queryLower.includes('berita')) {
      relevantTopics = isIndonesia
        ? ['government', 'technology', 'environment', 'crime', 'economy', 'fashion viral']
        : ['breaking news', 'politics', 'technology', 'entertainment', 'sports'];
      suggestedTitles = isIndonesia
        ? [
            'Indonesia terancam krisis air - AHY',
            'Prabowo - Transformasi Ekonomi Inovasi',
            'Gamis Bini Orang Viral 2026',
          ]
        : ['Breaking: Major Event', 'Tech News Update', 'Entertainment Buzz'];
      hashtags = isIndonesia
        ? ['BHNasional', 'KrisisAir', 'PrabowoPerkuatTeknologiRI', 'viral']
        : ['breaking', 'news', 'viral', 'trending'];
      insights = isIndonesia
        ? 'News content in Indonesia: Focus on government policies, technology announcements, fashion trends, and viral moments. Use serious tone.'
        : 'News content: Focus on breaking news, trending topics, and viral moments.';
    } else if (queryLower.includes('meme')) {
      relevantTopics = ['meme_explanation', 'viral_tips', 'comedy', 'edit viral'];
      suggestedTitles = isIndonesia
        ? ['Cara dapat 5M interaksi - viral tips', 'Meme viral paling update', 'Edit lucu trending']
        : ['meme explanation viral', 'trending meme breakdown', 'funny edit'];
      recommendedReferences = [
        'viral meme explanations',
        'trending hashtags',
        isIndonesia ? 'Indonesian slang' : 'English slang',
      ];
      hashtags = ['meme', 'viral', 'fyp', 'trending', 'comedy'];
      insights = isIndonesia
        ? 'Meme content: Explain trending memes, provide tips on going viral, use Indonesian slang (ngakak, lucu, dagelan).'
        : 'Meme content: Explain trending memes, create funny edits, use current slang.';
    } else if (
      queryLower.includes('product') ||
      queryLower.includes('digital') ||
      queryLower.includes('gadget') ||
      queryLower.includes('tech')
    ) {
      relevantTopics = isIndonesia
        ? ['tech_gadget', 'ecommerce', 'digital_subscription', 'digital_course', 'review hp']
        : ['tech_gadget', 'product_review', 'digital_subscription', 'unboxing'];
      suggestedTitles = isIndonesia
        ? [
            'iQOO 15R - Origin OS 6.0 + AI Magic Move',
            'Review Gadget Terbaru 2026',
            'Tech Review Indonesia',
          ]
        : ['iPhone 16 Pro Max Review', 'Latest Tech Unboxing', 'Gadget Comparison'];
      recommendedReferences = ['tech reviews', 'product demos', 'unboxing videos'];
      hashtags = isIndonesia
        ? ['review', 'gadget', 'teknologi', 'viral', '2026']
        : ['tech', 'review', 'unboxing', 'gadget', 'viral'];
      insights = isIndonesia
        ? 'Digital product content: Focus on gadgets, digital subscriptions, and online courses. Use promo pricing and benefits. Mention specific Indonesian prices.'
        : 'Tech content: Focus on latest gadgets, reviews, and unboxing. Use compelling visuals.';
    } else if (
      queryLower.includes('lucu') ||
      queryLower.includes('funny') ||
      queryLower.includes('comedy') ||
      queryLower.includes('dagelan')
    ) {
      relevantTopics = isIndonesia
        ? ['comedy', 'memes', 'funny videos', 'dagelan', 'ngakak', 'kucing lucu']
        : ['comedy', 'memes', 'funny videos', 'humor', 'sketch'];
      suggestedTitles = isIndonesia
        ? [
            'eh seronok betul😅 #Videolucu',
            'More???🤣😂 #funnyvideos',
            'kucing lucu gemoy imut cute',
            'prank gagal lucu',
          ]
        : ['funny moment 😂 #comedy', 'Epic fail compilation', 'hilarious situation'];
      recommendedReferences = ['Chopin Nocturne No. 2 Piano Mono', 'suara asli - trending audio'];
      hashtags = isIndonesia
        ? ['videolucu', 'dagelan', 'ngakak', 'lucu', 'memes', 'funny', 'fyp', 'viral']
        : ['comedy', 'funny', 'viral', 'fyp', 'lol', 'memes'];
      insights = isIndonesia
        ? 'For comedy/lucu content: Use relatable everyday situations, cute pets (kucing lucu), or trending sounds. Mix Indonesian local humor (dagelan, ngakak) with universal emotions.'
        : 'For comedy content: Use relatable situations, trending sounds, and universal humor.';
    } else if (queryLower.includes('dance') || queryLower.includes('challenge')) {
      relevantTopics = isIndonesia
        ? ['dance challenge', 'tiktok dance', 'viral dance', 'challenge']
        : ['dance challenge', 'tiktok dance', 'viral dance', 'choreography'];
      suggestedTitles = isIndonesia
        ? ['dance challenge viral 2026', 'tiktok dance terbaru', 'challenge trending']
        : ['dance challenge viral', 'trending dance', 'choreography edit'];
      recommendedReferences = [
        isIndonesia ? 'lagu trending TikTok Indonesia' : 'trending TikTok sounds',
        'beat drop viral 2026',
      ];
      hashtags = isIndonesia
        ? ['dancechallenge', 'tiktokdance', 'viral', 'fyp', 'trend']
        : ['dance', 'challenge', 'viral', 'fyp', 'trending'];
      insights = isIndonesia
        ? 'Dance content: Use trending songs, join popular challenges, and add Indonesian flavor.'
        : 'Dance content: Use trending songs and create unique choreography.';
    } else if (
      queryLower.includes('sport') ||
      queryLower.includes('football') ||
      queryLower.includes('soccer')
    ) {
      relevantTopics = ['sports edit', 'football highlight', 'athlete tribute', 'highlights'];
      suggestedTitles = [
        'Kevin de Bruyne edit - best skills ✨',
        'Sports highlights 2026',
        'Football best moments',
      ];
      recommendedReferences = ['sports edit templates', 'trending sports audio'];
      hashtags = ['football', 'sports', 'viral', 'highlights', 'fyp', 'soccer'];
      insights =
        'Sports content: Create edits with trending music, focus on memorable moments, use player highlights.';
    } else if (
      queryLower.includes('viral') ||
      queryLower.includes('trending') ||
      queryLower.includes('search') ||
      queryLower.includes('konten') ||
      queryLower.includes('fyp')
    ) {
      relevantTopics = region.trending_topics.map((t: any) => t.topic);
      suggestedTitles = region.recommended_titles.slice(0, 6);
      recommendedReferences = region.trending_sounds.slice(0, 5);
      hashtags = region.top_hashtags.slice(0, 10).map((h: any) => h.tag);
      insights =
        `Current viral trends (${period}):\n\n` +
        region.trending_topics
          .slice(0, 4)
          .map(
            (t: any) => `- ${t.topic}: ${t.examples.join(', ')} (${t.engagement_rate}% engagement)`
          )
          .join('\n') +
        `\n\nKey: Use ${hashtags
          .slice(0, 3)
          .map((h: string) => '#' + h)
          .join(' ')} hashtags and trending sounds.`;
    } else {
      relevantTopics = [
        ...this.data.indonesia.trending_topics.slice(0, 4),
        ...this.data.worldwide.trending_topics.slice(0, 4),
      ].map((t: any) => t.topic);
      suggestedTitles = [
        ...this.data.indonesia.recommended_titles.slice(0, 3),
        ...this.data.worldwide.recommended_titles.slice(0, 3),
      ];
      recommendedReferences = [
        ...this.data.indonesia.trending_sounds.slice(0, 3),
        ...this.data.worldwide.trending_sounds.slice(0, 2),
      ];
      hashtags = [
        ...this.data.indonesia.top_hashtags.slice(0, 5),
        ...this.data.worldwide.top_hashtags.slice(0, 5),
      ].map((h: any) => h.tag);
      insights =
        `General viral formula (${period}):\n\n` +
        `1. Use trending hashtags (#fyp, #viral, #foryou)\n` +
        `2. Post at prime times (7-9 AM or 5-8 PM)\n` +
        `3. Create relatable content\n` +
        `4. Use trending sounds\n` +
        `5. Add curiosity gap in title\n` +
        `\nFor Indonesia: Use local slang (dagelan, ngakak, lucu), focus on emotional and pet content.\nWorldwide: Focus on emotional content, music, and entertainment.`;
    }

    return {
      relevantTopics,
      suggestedTitles,
      recommendedReferences,
      hashtags,
      insights,
    };
  }
}

export const viralContentResearch = new ViralContentResearch();
export { ViralContentResearch, SearchResult };
