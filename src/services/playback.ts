import { Episode, EpisodeServer } from '../types';

// A hostname explicitly reported by the user's antivirus. Do not mask/proxy it.
const suspendedHosts = ['phim1280.tv'];
export function mediaUrl(value?: string): string | undefined {
  if (!value?.trim()) return undefined;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : undefined;
  } catch { return undefined; }
}
export function sourceIssue(server: EpisodeServer): string | undefined {
  const urls = [server.m3u8, server.url].filter(Boolean);
  if (!urls.some(url => mediaUrl(url))) return 'Không có liên kết HTTPS hợp lệ.';
  for (const value of urls) {
    try {
      const host = new URL(value).hostname.toLowerCase();
      if (suspendedHosts.some(domain => host === domain || host.endsWith(`.${domain}`)))
        return 'Nguồn phim1280.tv đã bị phần mềm bảo vệ cảnh báo; tạm ngưng kết nối nguồn này.';
    } catch { /* invalid URLs are never loaded */ }
  }
}
export function episodeServers(episode?: Episode | null): EpisodeServer[] {
  if (!episode) return [];
  let list = episode.servers?.length ? episode.servers : [
    { id: 'legacy-vs', name: 'Vietsub', url: episode.link_embed || episode.vs || '', m3u8: episode.m3u8 || (/\.m3u8(?:[?#]|$)/i.test(episode.vs || '') ? episode.vs : undefined) },
    { id: 'legacy-tm', name: 'Thuyết minh', url: episode.tm || '', m3u8: episode.m3u8_tm || (/\.m3u8(?:[?#]|$)/i.test(episode.tm || '') ? episode.tm : undefined) },
  ];
  const seen = new Set<string>();
  return list.map(server => {
    const m3u8 = mediaUrl(server.m3u8) || (/\.m3u8(?:[?#]|$)/i.test(server.url) ? mediaUrl(server.url) : undefined);
    const url = mediaUrl(server.url) || m3u8 || '';
    return { ...server, url, m3u8, isEmbed: !m3u8 };
  }).filter(server => {
    const key = server.m3u8 || server.url;
    if (!key || seen.has(key)) return false;
    seen.add(key); return true;
  });
}
export function parseKKPhimEpisodes(data: any): Episode[] {
  const episodes = new Map<string, Episode>();
  for (const [index, server] of (Array.isArray(data.episodes) ? data.episodes : []).entries()) {
    const name = String(server.server_name || `Nguồn ${index + 1}`);
    const isTm = /thuyết minh|thuyet minh/i.test(name);
    for (const item of server.server_data || []) {
      const raw = String(item.name || item.slug || '').trim();
      if (!raw) continue;
      const tap = /^\d+$/.test(raw) ? String(Number(raw)) : raw;
      const m3u8 = mediaUrl(item.link_m3u8);
      const embed = mediaUrl(item.link_embed);
      if (!m3u8 && !embed) continue;
      const episode: Episode = episodes.get(tap) || { tap, servers: [] };
      episode.servers!.push({ id: `kk-${index}`, name, url: embed || m3u8!, m3u8, isEmbed: !m3u8 });
      if (isTm) { episode.tm ||= embed || m3u8; episode.m3u8_tm ||= m3u8; }
      else { episode.vs ||= embed || m3u8; episode.m3u8 ||= m3u8; }
      episode.link_embed ||= embed;
      episodes.set(tap, episode);
    }
  }
  return Array.from(episodes.values()).map(episode => ({ ...episode, servers: episodeServers(episode) }))
    .sort((a, b) => a.tap.localeCompare(b.tap, 'vi', { numeric: true }));
}
