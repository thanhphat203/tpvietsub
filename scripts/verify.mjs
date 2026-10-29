import assert from 'node:assert/strict';
import { createServer } from 'vite';
const server = await createServer({ configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true }, appType: 'custom' });
const realFetch = globalThis.fetch;
try {
  const api = await server.ssrLoadModule('/src/services/api.ts');
  const { fetchCatalog, positivePage } = await server.ssrLoadModule('/src/services/catalog.ts');
  const playback = await server.ssrLoadModule('/src/services/playback.ts');
  const parsed = playback.parseKKPhimEpisodes({ episodes: [
    { server_name: 'Vietsub 1', server_data: [{ name: 'Full', link_m3u8: 'https://media.test/one.m3u8', link_embed: 'https://embed.test/one' }] },
    { server_name: 'Vietsub 2', server_data: [{ name: 'Full', link_m3u8: 'https://media.test/two.m3u8', link_embed: 'https://embed.test/two' }] },
    { server_name: 'Thuyết minh', server_data: [{ name: 'Full', link_embed: 'https://embed.test/tm' }] },
    { server_name: 'Duplicate', server_data: [{ name: 'Full', link_m3u8: 'https://media.test/one.m3u8' }] },
  ] });
  assert.equal(parsed.length, 1); assert.equal(parsed[0].servers.length, 3);
  assert.equal(parsed[0].servers[0].url, 'https://embed.test/one');
  assert.equal(parsed[0].servers[0].m3u8, 'https://media.test/one.m3u8');
  assert.equal(parsed[0].servers[2].isEmbed, true);
  assert(playback.sourceIssue({ id:'blocked', name:'Blocked', url:'https://s5.phim1280.tv/video.m3u8' }));
  assert(playback.sourceIssue({ id:'mixed', name:'Mixed', url:'https://embed.test/player', m3u8:'https://s5.phim1280.tv/video.m3u8' }));
  assert.equal(playback.sourceIssue({ id:'allowed', name:'Allowed', url:'https://phim1280.tv.example.test/player' }), undefined);
  assert.equal(playback.mediaUrl('javascript:alert(1)'), undefined);
  assert.equal(playback.mediaUrl('http://media.test/video.m3u8'), undefined);
  assert.equal(playback.episodeServers({tap:'1',vs:'https://media.test/a.m3u8'})[0].m3u8, 'https://media.test/a.m3u8');
  const movie = api.transformKKPhimMovie({ slug: 'test', name: 'Test', type: 'series', time: '45 phút/tập', country: [{ name: 'Hàn Quốc' }], category: [{ name: 'Hành Động' }], year: 2026 });
  assert.equal(movie.type, 'series'); assert.equal(movie.country, 'Hàn Quốc'); assert.equal(movie.rating, 0);
  assert(!movie.genres.includes('Chiếu Rạp'));
  const single = api.transformKKPhimMovie({ slug: 'cinema', type: 'single', chieurap: true, tmdb: { vote_average: 8.1 } });
  assert.equal(single.type, 'single'); assert(single.genres.includes('Chiếu Rạp')); assert.equal(single.rating, 8.1);
  assert.equal(api.transformKKPhimMovie({slug:'unknown'}).country, 'Chưa rõ');
  assert.equal(api.getHdImageUrl('https://image.tmdb.org/t/p/original/test.jpg'), 'https://image.tmdb.org/t/p/w500/test.jpg');
  for (const input of [null, 'abc', '0', '-5', '1.5']) assert.equal(positivePage(input), 1);
  let calls = 0; const urls = [];
  globalThis.fetch = async url => {
    calls++; urls.push(String(url));
    const page = new URL(url).searchParams.get('page');
    return new Response(JSON.stringify({ data: { items: [{slug: `page-${page}`,type: 'series'}], params: {pagination: {totalItems: 100,totalItemsPerPage: 24}} }}), {status:200});
  };
  const q = {page:1,country:'Hàn Quốc',genre:'Hành Động',type:'series'};
  const [a,b] = await Promise.all([fetchCatalog(q),fetchCatalog(q)]);
  assert.equal(calls,1);assert.deepEqual(a,b);assert.equal(a.totalPages,5);
  assert(urls[0].includes('/phim-bo?'));assert(urls[0].includes('country=han-quoc'));assert(urls[0].includes('category=hanh-dong'));
  await fetchCatalog(q);assert.equal(calls,1);
  const second=await fetchCatalog({...q,page:2});assert.equal(second.movies[0].slug,'page-2');assert.equal(calls,2);
  globalThis.fetch=async()=>new Response('upstream down',{status:503});
  await assert.rejects(fetchCatalog({...q,page:3}));
  globalThis.fetch=async()=>new Response(JSON.stringify({data:{items:[],params:{pagination:{totalItems:0}}}}));
  assert.equal((await fetchCatalog({...q,page:3})).total,0);
  const curated=await fetchCatalog({page:1,collection:'blockbusters'});assert(curated.total>=10);assert.equal(new Set(curated.movies.map(m=>m.slug)).size,curated.total);
  console.log('PASS: playback parsing, source deduplication, embedded URLs, suspended hosts, HTTPS validation, classification, ratings, images, page validation, filters, deduplication, cache, API pagination, retry, curation');
} finally { globalThis.fetch = realFetch; await server.close(); }

