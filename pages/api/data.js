import axios from 'axios';

let twitch_token = null;

// Получение токена Twitch
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
    const daToken = process.env.DA_ACCESS_TOKEN; // Используем уже полученный вручную токен
    const twitchToken = await getTwitchToken();

    // Получение данных Donation Alerts
    const donations = await axios.get('https://www.donationalerts.com/api/v1/alerts/donations', {
      headers: { Authorization: `Bearer ${daToken}` },
    });

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentDonations = donations.data.data.filter(donation => {
      const donationDate = new Date(donation.created_at);
      return donationDate >= oneWeekAgo;
    });

    // Замените это на ваш реальный Twitch User ID:
    const twitchUserId = 'ВАШ_TWITCH_USER_ID';
    const subscriptions = await axios.get(
      `https://api.twitch.tv/helix/subscriptions?broadcaster_id=${twitchUserId}`,
      {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${twitchToken}`,
        },
      }
    );

    res.status(200).json({
      donations: recentDonations,
      subs: subscriptions.data.data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
