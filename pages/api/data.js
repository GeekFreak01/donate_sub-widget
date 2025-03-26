import axios from 'axios';

export default async function handler(req, res) {
  try {
    // DonationAlerts
    const daToken = process.env.DA_ACCESS_TOKEN;
    const { data: daResponse } = await axios.get(
      'https://www.donationalerts.com/api/v1/alerts/donations',
      { headers: { Authorization: `Bearer ${daToken}` } }
    );

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const topDonors = Object.values(
      daResponse.data
        .filter(d => new Date(d.created_at) >= oneWeekAgo)
        .reduce((acc, { username, amount, currency }) => {
          if (!acc[username]) acc[username] = { icon: '💰', username, total: 0, currency };
          acc[username].total += amount;
          return acc;
        }, {})
    ).sort((a, b) => b.total - a.total);

    // Twitch subscriptions — используем готовый токен
    const twitchToken = process.env.TWITCH_ACCESS_TOKEN;
    const twitchUserId = process.env.TWITCH_USER_ID;

    const { data: subsResponse } = await axios.get(
      `https://api.twitch.tv/helix/subscriptions?broadcaster_id=${twitchUserId}`,
      {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${twitchToken}`
        }
      }
    );

    const giftedSubs = subsResponse.data
      .filter(s => s.is_gift)
      .map(s => ({ icon: '🎁', user_name: s.user_name, count: s.total }));

    const selfSubs = subsResponse.data
      .filter(s => !s.is_gift)
      .map(s => ({ icon: '👤', user_name: s.user_name, months: s.cumulative_months }));

    return res.status(200).json({ topDonors, giftedSubs, selfSubs });
  } catch (error) {
    console.error('Error in /api/data:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({ error: error.message });
  }
}
