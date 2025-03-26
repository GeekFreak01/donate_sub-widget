import axios from 'axios';

export default async function handler(req, res) {
  try {
    // — Проверяем DonationAlerts —
    const daToken = process.env.DA_ACCESS_TOKEN;
    await axios.get('https://www.donationalerts.com/api/v1/alerts/donations', {
      headers: { Authorization: `Bearer ${daToken}` }
    });

    // — Проверяем Twitch OAuth токен —
    const twitchToken = process.env.TWITCH_ACCESS_TOKEN;
    const twitchUserId = process.env.TWITCH_USER_ID;
    const userResp = await axios.get('https://api.twitch.tv/helix/users', {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${twitchToken}`
      }
    });

    const actualId = userResp.data.data[0]?.id;
    if (actualId !== twitchUserId) {
      return res.status(401).json({ error: `Broadcaster ID mismatch: token belongs to ${actualId}, but TWITCH_USER_ID=${twitchUserId}` });
    }

    // — Если всё ок — возвращаем успех —
    return res.status(200).json({ message: '✅ DonationAlerts OK; ✅ Twitch token & ID match' });
  } catch (err) {
    const { status = 500, data } = err.response || {};
    return res.status(status).json({ error: data?.message || err.message });
  }
}
