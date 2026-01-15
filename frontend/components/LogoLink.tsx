'use client';

import { useRouter } from 'next/navigation';
import { MouseEvent } from 'react';

interface LogoLinkProps {
    children: React.ReactNode;
    className?: string;
}

export function LogoLink({ children, className = '' }: LogoLinkProps) {
    const router = useRouter();

    const handleClick = (e: MouseEvent) => {
        e.preventDefault();
        // Check for user token to determine auth status
        const token = localStorage.getItem('user_token');

        if (token) {
            router.push('/dashboard');
        } else {
            router.push('/');
        }
    };

    return (
        <a
            href="/"
            onClick={handleClick}
            className={`cursor-pointer select-none transition-opacity hover:opacity-80 active:opacity-60 ${className}`}
            aria-label="MagineAI Home"
        >
            {children}
        </a>
    );
}
