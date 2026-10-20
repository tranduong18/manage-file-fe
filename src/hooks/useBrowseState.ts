import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Crumb } from '../components/folders/Breadcrumb';

export const ROOT: Crumb = { id: null, name: 'Thư mục gốc' };

function parseTrail(raw: string | null): Crumb[] {
    if (!raw) return [];
    try {
        const arr = JSON.parse(raw);
        if (!Array.isArray(arr)) return [];
        return arr
            .filter((c) => c && typeof c.id === 'string' && typeof c.name === 'string')
            .map((c) => ({ id: c.id as string, name: c.name as string }));
    } catch {
        return [];
    }
}

// URL dạng: /?trail=[{"id":"...","name":"..."}]&page=2
export function useBrowseState() {
    const [params, setParams] = useSearchParams();
    const rawTrail = params.get('trail');
    const rawPage = params.get('page');

    const trail = useMemo(() => [ROOT, ...parseTrail(rawTrail)], [rawTrail]);
    const page = Math.max(1, Number(rawPage) || 1);

    const go = useCallback(
        (nextTrail: Crumb[], nextPage = 1, replace = false) => {
            const p = new URLSearchParams();
            if (nextTrail.length > 1) p.set('trail', JSON.stringify(nextTrail.slice(1)));
            if (nextPage > 1) p.set('page', String(nextPage));
            setParams(p, { replace });
        },
        [setParams]
    );

    return { trail, page, go };
}