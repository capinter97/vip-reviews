import type { Context } from '@netlify/functions'

export default async (request: Request, context: Context) => {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Google Places API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const placeId = process.env.GOOGLE_PLACE_ID
    if (!placeId) {
      return new Response(JSON.stringify({ error: 'Google Place ID not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Call Google Places API to get place details with reviews
    const googleApiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews,user_ratings_total&key=${apiKey}`
    
    const response = await fetch(googleApiUrl)
    const data = await response.json()

    if (data.status !== 'OK') {
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch reviews from Google Places API',
        details: data.error_message || data.status 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Return the reviews data
    return new Response(JSON.stringify({
      name: data.result.name,
      rating: data.result.rating,
      user_ratings_total: data.result.user_ratings_total,
      reviews: data.result.reviews || []
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
