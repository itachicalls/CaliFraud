import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 86400 // 24h

const CA_GEOJSON_URL = 'https://raw.githubusercontent.com/glynnbird/usstatesgeojson/master/california.geojson'

export async function GET() {
  try {
    const res = await fetch(CA_GEOJSON_URL, {
      headers: {
        'User-Agent': 'CaliFraud/1.0 (https://github.com/califraud)',
      },
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Geo outline API error:', error)
    return NextResponse.json(
      { type: 'FeatureCollection', features: [] },
      { status: 502 }
    )
  }
}
