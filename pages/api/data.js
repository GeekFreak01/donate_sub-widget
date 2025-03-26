import axios from 'axios';

let twitch_token = null;

async function getTwitchToken() {
  if (twitch_token) return twitch_token;

  const { data } = await axios.post(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_SECRET}&grant_type=client_credentials`
  );
  twitch_token = data.access_token;
  return twitch_token;
}

export default async function handler(req, res) {
  try {
    const daToken = process.env.DA_ACCESS_TOKEN; // ваш вручную полученный токен

    // Проверка DonationAlerts
    const { data: donationsData } = await axios.get(
      'https://www.donationalerts.com/api/v1/alerts/donations',
      { headers: { Authorization: `Bearer ${daToken}` } }
    );

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentDonations = donationsData.data.filter(d => new Date(d.created_at) >= oneWeekAgo);

    const twitchToken = await getTwitchToken();
    const twitchUserId = '<ВАШ_TWITCH_USER_ID>'; // <- замените на реальный ID
    const { data: subsData } = await axios.get(
      `https://api.twitch.tv/helix/subscriptions?broadcaster_id=${twitchUserId}`,
      {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${twitchToken}`
        }
      }
    );

    return res.status(200).json({ donations: recentDonations, subs: subsData.data });
  } catch (error) {
    console.error('API error:', error.response?.data || error.message);
    return res.status(500).json({ error: error.message });
  }
}
