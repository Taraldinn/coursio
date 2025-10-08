import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';

const geistSans = localFont({
    src: './fonts/GeistVF.woff',
    variable: '--font-geist-sans',
    weight: '100 900'
});

const geistMono = localFont({
    src: './fonts/GeistMonoVF.woff',
    variable: '--font-geist-mono',
    weight: '100 900'
});

export const metadata: Metadata = {
    title: 'Coursio - Track Your Learning Journey',
    description: 'Transform YouTube playlists into structured courses. Track your progress, take notes, and never lose your place. All for free.',
    generator: 'v0.app'
};

const CLERK_PUBLISHABLE_KEY =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_ZXhvdGljLXN3aWZ0LTk2LmNsZXJrLmFjY291bnRzLmRldiQ"

const Layout = ({ children }: Readonly<{ children: ReactNode }>) => {
    return (
        <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
            <html suppressHydrationWarning lang='en'>
                <body
                    className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground overscroll-none antialiased`}>
                    <ThemeProvider attribute='class'>
                        {children}
                        <Toaster />
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
};

export default Layout;

