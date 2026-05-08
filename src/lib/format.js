// Sayı/tarih biçimlendirme yardımcıları

export function formatTL(val) {
  if (val == null || isNaN(val)) return '—';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(val);
}

export function formatNumber(val) {
  if (val == null || isNaN(val)) return '—';
  return new Intl.NumberFormat('tr-TR').format(val);
}

export function formatDate(date) {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateInput(date) {
  if (!date) return '';
  const d = new Date(date);
  const yil = d.getFullYear();
  const ay = String(d.getMonth() + 1).padStart(2, '0');
  const gun = String(d.getDate()).padStart(2, '0');
  return `${yil}-${ay}-${gun}`;
}

export function formatPercent(val) {
  if (val == null || isNaN(val)) return '—';
  return `%${(val * 100).toFixed(2)}`;
}
