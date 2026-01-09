export default function EmbedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-full w-full overflow-hidden" style={{ position: 'relative', height: '100%', width: '100%' }}>
            {children}
        </div>
    );
}
