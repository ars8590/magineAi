'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { userLogin } from '../../lib/api';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { token, user } = await userLogin(email, userPassword);
            localStorage.setItem('user_token', token);
            localStorage.setItem('user_info', JSON.stringify(user));
            router.push('/dashboard');
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Login failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-1 w-full h-full min-h-screen bg-background-light dark:bg-background-dark font-display">
            {/* Left Side: Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 xl:p-24 relative z-10 bg-background-light dark:bg-background-dark">
                <div className="w-full max-w-md flex flex-col gap-8">
                    {/* Logo Header */}
                    <div className="flex items-center gap-3">
                        <div className="size-8 text-primary">
                            <span className="material-symbols-outlined text-[32px]">auto_awesome</span>
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">MagineAI</h2>
                    </div>
                    {/* Headline */}
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Welcome back, Creator</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">Log in to access your personalized library.</p>
                    </div>
                    {/* Form */}
                    <form onSubmit={onSubmit} className="flex flex-col gap-5">
                        {/* Email Field */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-900 dark:text-gray-200" htmlFor="email">Email</label>
                            <div className="relative">
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3.5 text-base text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary dark:focus:border-primary transition-all"
                                    required
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">mail</span>
                                </span>
                            </div>
                        </div>
                        {/* Password Field */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-900 dark:text-gray-200" htmlFor="password">Password</label>
                                <a className="text-sm font-medium text-primary hover:text-primary/80 transition-colors" href="#">Forgot Password?</a>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={userPassword}
                                    onChange={(e) => setUserPassword(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3.5 text-base text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary dark:focus:border-primary transition-all"
                                    required
                                />
                                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none" type="button">
                                    <span className="material-symbols-outlined text-[20px]">visibility_off</span>
                                </button>
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg">{error}</p>}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 w-full rounded-lg bg-primary py-3.5 text-white font-bold text-base shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark transition-all transform active:scale-[0.99] disabled:opacity-70"
                        >
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>

                        {/* Divider */}
                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">Or continue with</span>
                            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                        </div>
                        {/* Social Login */}
                        <div className="grid grid-cols-1 gap-4">
                            <button type="button" className="flex items-center justify-center gap-2 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-3 px-4 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuClDDQxWfdFRdRX3P9fgtWSHY34GNj3d2ihvKo02Ca8k9699ebH31U8kP4dXJ4SPxz2l-Uowadtkq59GMdMqOSCmtpAojaZb6bY7eRq4zS-JWkb4KhP4IyRYWoRX7PTqu5-MOVMoYsyjB6-yJru5pRU8paWWCHgK8Aiwa8lwLqy1W6CjAzQ4I82tofY8foxfVhMQFD3BnNKvF6bhRSgBldGSD6g6OKyKasn80cQ7H-PBDNVhFzd1SWLt3PnBLF6VgEKhUCapidssrBV" />
                                <span>Google</span>
                            </button>

                        </div>
                    </form>
                    {/* Footer Sign Up Prompt */}
                    <p className="text-center text-gray-500 dark:text-gray-400">
                        Don't have an account?
                        <Link href="/signup" className="font-bold text-primary hover:text-primary/80 transition-colors ml-1">
                            Sign up for free
                        </Link>
                    </p>
                </div>
                <div className="absolute bottom-6 text-xs text-gray-400 dark:text-gray-600">
                    © 2024 MagineAI. All rights reserved.
                </div>
            </div>
            {/* Right Side: Hero Image */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-primary/5">
                <div className="absolute inset-0 z-0">
                    <img alt="Abstract colorful gradient waves representing digital creativity" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEUh87LIwicRICyHteGHTdxLF5GulpyebL1MgsyQySrTbtn05Cxy419nzUdHR6MzWmv5LgrEWP5gVEve_-lM4uXe7UT1v_i93NcQg6J3LeUlf7Tshr339e4mm3J-VYYvtNZVta3y6Y0jf9syaPBu-aM4OdrBrM5OTkA9FbHD-GclvW8rwTm5838Pf3IBzfM40mQqXfOrcWw9HO0eUGIQu5BJolHbiSLZEKT5sxz6d_GueZ_B5GlYxx1wwcxc_WHZYuWxt2OBo3rJkp" />
                    {/* Gradient Overlay to blend nicely with the left side */}
                    <div className="absolute inset-0 bg-gradient-to-r from-background-light/80 to-transparent dark:from-background-dark/80 dark:to-transparent"></div>
                    {/* Tint Overlay */}
                    <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
                </div>
                {/* Content overlay on image */}
                <div className="relative z-10 w-full h-full flex flex-col justify-end p-16 pb-24 text-white">
                    <div className="max-w-lg">
                        <div className="mb-4 inline-flex items-center justify-center size-12 rounded-xl bg-white/20 backdrop-blur-md border border-white/10">
                            <span className="material-symbols-outlined text-white">auto_awesome</span>
                        </div>
                        <blockquote className="text-3xl font-bold leading-tight mb-4">
                            "MagineAI transformed how I visualize stories. It's not just a tool, it's a muse."
                        </blockquote>
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-full overflow-hidden border-2 border-white/30">
                                <img alt="Portrait of a female user" className="object-cover w-full h-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2YYJ6NcJC7vWOQBssOnDwYA3VtpgjkOq--bxakuYbFVDLToqIZEvdy-ZepqIvnNEWttTm6NHCvyf9L3KVhA39Z46GuGAxEw_9IwKZCjvkF_-caP3lhfzVpfBB2pGkoBenumW1BXP_FK1EmBhSIRCedCwr_-pEtzBYHN4CZ1wMO1tWRjkMMExkwncThdLC2GdHXu1nsBwbT_UpvIyPXoY7GZiGONfxrf0Xf2ijMYarEJ3nf-xYNvVQB1Pqa3EChaIxbDsMBOLLt6hr" />
                            </div>
                            <div>
                                <p className="font-bold text-base">Sarah Jenkins</p>
                                <p className="text-sm text-white/80">Best-selling Author</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
