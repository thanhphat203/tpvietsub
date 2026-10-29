import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function TVNavigation() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      const current = document.activeElement as HTMLElement;
      if (current?.matches('input, textarea, select, video, [contenteditable="true"]')) return;
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      const candidates = Array.from(document.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), select, input, video[controls]')).filter(el => {
        const r = el.getBoundingClientRect(); const style = getComputedStyle(el);
        return el.tabIndex >= 0 && r.width > 0 && r.height > 0 && style.visibility !== 'hidden' && style.display !== 'none' && !el.closest('[aria-hidden="true"]');
      });
      const origin = current?.getBoundingClientRect();
      if (!origin || !candidates.includes(current)) { candidates[0]?.focus(); event.preventDefault(); return; }
      const x = origin.left + origin.width / 2, y = origin.top + origin.height / 2;
      const horizontal = event.key === 'ArrowLeft' || event.key === 'ArrowRight';
      const sign = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
      let best: HTMLElement | undefined, score = Infinity;
      for (const el of candidates) {
        if (el === current) continue;
        const r = el.getBoundingClientRect();
        const dx = r.left + r.width / 2 - x, dy = r.top + r.height / 2 - y;
        const forward = (horizontal ? dx : dy) * sign;
        const cross = Math.abs(horizontal ? dy : dx);
        if (forward <= 4) continue;
        const next = forward + cross * 4;
        if (next < score) { score = next; best = el; }
      }
      if (best) { event.preventDefault(); best.focus({ preventScroll: true }); best.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' }); }
    };
    document.addEventListener('keydown', keydown);
    return () => document.removeEventListener('keydown', keydown);
  }, [pathname, search]);
  return null;
}
