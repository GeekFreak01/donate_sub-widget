import axios from 'axios';

export default async function handler(req, res) {
  try {
    const daToken = process.env.DA_ACCESS_TOKEN;
    const twitchToken = process.env.TWITCH_ACCESS_TOKEN;
    const twitchUserId = process.env.TWITCH_USER_ID;

    // Запросы выполняются параллельно
    const [daRes, twitchRes] = await Promise.all([
      axios.get('https://www.donationalerts.com/api/v1/alerts/donations', {
        headers: { Authorization: `Bearer ${daToken}` }
      }),
      axios.get(`https://api.twitch.tv/helix/subscriptions?broadcaster_id=${twitchUserId}`, {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${twitchToken}`
        }
      })
    ]);

    // Обработка DonationAlerts
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const topDonors = Object.values(
      daRes.data.data
        .filter(d => new Date(d.created_at).getTime() >= weekAgo)
        .reduce((acc, { username, amount, currency }) => {
          if (!acc[username]) acc[username] = { icon: '💰', username, total: 0, currency };
          acc[username].total += amount;
          return acc;
        }, {})
    ).sort((a, b) => b.total - a.total);

    // Обработка Twitch подписок
    const subs = twitchRes.data.data;
    const giftedSubs = subs.filter(s => s.is_gift).map(s => ({ icon: '🎁', user_name: s.user_name, count: s.total }));
    const selfSubs   = subs.filter(s => !s.is_gift).map(s => ({ icon: '👤', user_name: s.user_name, months: s.cumulative_months }));

    return res.status(200).json({ topDonors, giftedSubs, selfSubs });
  } catch (error) {
    console.error('API error:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    return res.status(status).json({ error: error.response?.data?.message || error.message });
  }
}
