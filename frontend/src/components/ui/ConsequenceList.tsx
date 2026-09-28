type ConsequenceListProps = {
    items: string[];
};

/** Red-ruled "CONSEQUENCES" box listing what an action will do. */
export default function ConsequenceList({ items }: ConsequenceListProps) {
    return (
        <div className="border-l-2 border-crimson bg-sunken px-4 py-3">
            <p className="mb-2 text-2xs font-bold tracking-caps text-crimson">CONSEQUENCES</p>

            <ul className="space-y-1.5 text-xs leading-relaxed text-muted">
                {items.map((item) => (
                    <li key={item}>{`// ${item}`}</li>
                ))}
            </ul>
        </div>
    );
}
