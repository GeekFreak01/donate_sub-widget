// pages/api/data.js
import axios from 'axios';

let da_token = null;
let twitch_token = null;

// Donation Alerts Access Token
async function getDonationAlertsToken() {
  if (da_token) return da_token;

  const { data } = await axios.post(
    'https://www.donationalerts.com/oauth/token',
    {
      grant_type: 'client_credentials',
      client_id: process.env.DA_CLIENT_ID,
      client_secret: process.env.DA_CLIENT_SECRET,
      scope: 'oauth-donation-index',
    }
  );

  da_token = data.access_token;
  return da_token;
}

// Twitch Access Token
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
    const daToken = await getDonationAlertsToken();
    const twitchToken = await getTwitchToken();

    const donations = await axios.get('https://www.donationalerts.com/api/v1/alerts/donations', {
      headers: { Authorization: `Bearer ${daToken}` },
    });

    // За последнюю неделю
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentDonations = donations.data.data.filter(donation => {
      const donationDate = new Date(donation.created_at);
      return donationDate >= oneWeekAgo;
    });

    // Получаем сабов и подарочные сабы (здесь нужен user_id вашего канала Twitch)
    const twitchUserId = 'Ваш_Twitch_User_ID';
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
