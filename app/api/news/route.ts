import { NextResponse } from 'next/server'
import Parser from 'rss-parser'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 300 // 5 minutes

const parser = new Parser({
  headers: {
    'User-Agent':
      'Mozilla/5.0 (compatible; CaliFraud/1.0; +https://github.com/califraud)',
  },
})

export async function GET() {
  try {
    const rssUrl =
      'https://news.google.com/rss/search?q=california+fraud&hl=en-US&gl=US&ceid=US:en'
    const feed = await parser.parseURL(rssUrl)
    const items = (feed.items || []).slice(0, 8).map((item) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      source: item.creator || item['dc:creator'] || 'News',
    }))
    return NextResponse.json({ items })
  } catch (error) {
    console.error('News API error:', error)
    return NextResponse.json({ items: [] })
  }
}
