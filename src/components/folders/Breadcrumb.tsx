export interface Crumb {
    id: string | null; // googleFolderId, null = gốc
    name: string;
}

interface Props {
    trail: Crumb[]; // luôn có phần tử đầu là gốc
    onNavigate: (index: number) => void;
}

export default function Breadcrumb({ trail, onNavigate }: Props) {
    return (
        <nav className="flex flex-wrap items-center gap-1 text-sm">
            {trail.map((c, i) => {
                const last = i === trail.length - 1;
                return (
                    <span key={c.id ?? 'root'} className="flex items-center gap-1">
            {i > 0 && <span className="text-gray-400">/</span>}
                        {last ? (
                            <span className="font-medium">{c.name}</span>
                        ) : (
                            <button onClick={() => onNavigate(i)} className="text-blue-600 hover:underline">
                                {c.name}
                            </button>
                        )}
          </span>
                );
            })}
        </nav>
    );
}