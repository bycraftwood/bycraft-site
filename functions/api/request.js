// BYCRAFT: приём заявок и отправка в Telegram (Cloudflare Pages Function, маршрут /api/request)
// Нужны переменные окружения в Cloudflare Pages: TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });

const clean = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f]+/g, ' ').trim().slice(0, n);
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      if (new URL(origin).host !== new URL(request.url).host) return json({ ok: false, error: 'origin' }, 403);
    } catch (e) {
      return json({ ok: false, error: 'origin' }, 403);
    }
  }

  let d;
  try { d = await request.json(); } catch (e) { return json({ ok: false, error: 'bad_request' }, 400); }

  if (d && d.website) return json({ ok: true });               /* ловушка для ботов */

  const name = clean(d.name, 80);
  const contact = clean(d.contact, 120);
  const role = clean(d.role, 40);
  const comment = clean(d.comment, 1000);
  const work = clean(d.work, 40);
  const page = clean(d.page, 200);
  if (!name || contact.length < 5) return json({ ok: false, error: 'validation' }, 422);

  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return json({ ok: false, error: 'not_configured' }, 500);

  const lines = [
    '<b>Запрос на работу</b>',
    work ? '<b>' + esc(work) + '</b>' : '',
    'Имя: ' + esc(name),
    'Контакт: ' + esc(contact),
    role ? 'Кто: ' + esc(role) : '',
    comment ? 'Комментарий: ' + esc(comment) : '',
    page ? 'Страница: ' + esc(page) : ''
  ].filter(Boolean);

  const r = await fetch('https://api.telegram.org/bot' + env.TELEGRAM_BOT_TOKEN + '/sendMessage', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text: lines.join('\n'),
      parse_mode: 'HTML',
      disable_web_page_preview: true
    })
  });
  if (!r.ok) return json({ ok: false, error: 'telegram' }, 502);
  return json({ ok: true });
}

export const onRequest = () => new Response('Method Not Allowed', { status: 405, headers: { allow: 'POST' } });
