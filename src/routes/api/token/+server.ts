// @ts-nocheck
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export async function POST({ request }) {
	const response = await fetch(`https://discord.com/api/oauth2/token`, {
		method: "POST",
		headers: {
		"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
		client_id: process.env.VITE_DISCORD_CLIENT_ID,
		client_secret: process.env.DISCORD_CLIENT_SECRET,
		grant_type: "authorization_code",
		code: request.body.code,
		}),
  	});

  	const { access_token } = await response.json();
	return json({access_token});
}
