import axios from 'axios';

export default async function handler(req, res) {
  try {
    const daToken = process.env.DA_ACCESS_TOKEN;
    const twitchToken = process.env.TWITCH_ACCESS_TOKEN;
    const twitchUserId = process.env.TWITCH_USER_ID;

    const [daRes, subsRes] = await Promise.all([
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

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const donors = Object.values(
      daRes.data.data
        .filter(d => new Date(d.created_at).getTime() >= weekAgo)
        .reduce((acc, { username, amount, currency }) => {
          if (!acc[username]) acc[username] = { icon: '💰', text: `${username} — ${amount} ${currency}`, total: amount };
          else {
            acc[username].total += amount;
            acc[username].text = `${username} — ${acc[username].total} ${currency}`;
          }
          return acc;
        }, {})
    ).sort((a, b) => b.total - a.total);

    const subs = subsRes.data.data;

    // Группировка подарочных подписок по дарителю
    const gifted = Object.values(
      subs
        .filter(s => s.is_gift)
        .reduce((acc, s) => {
          const name = s.gifter_name;
          if (!acc[name]) acc[name] = { icon: '🎁', text: '', count: 0 };
          acc[name].count += 1;
          acc[name].text = `${name} — ${acc[name].count} шт`;
          return acc;
        }, {})
    );

    const self = subs
      .filter(s => !s.is_gift && s.user_id !== twitchUserId)
      .map(s => ({ icon: '👤', text: `${s.user_name} — подписан ${s.cumulative_months ?? 0} мес.` }));

    const items = [...gifted, ...self, ...donors];
    return res.status(200).json({ items });
  } catch (err) {
    console.error('Error in /api/data:', err.response?.data || err.message);
    return res.status(err.response?.status || 500).json({ error: err.message });
  }
}
