'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { Store, Shield, Users, TrendingUp, Star, Mail, Lock, Eye, EyeOff, Loader2, Gift } from 'lucide-react';

function AnimatedCounter({ end, duration = 1500 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(end * easeOutQuart));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <>{count.toLocaleString()}</>;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = trpc.auth.login.useMutation();
  const loginWithMfaMutation = trpc.auth.loginWithMFA.useMutation();

  // Check if user is already logged in
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      // User already has a token, redirect to admin
      router.push('/admin');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (requiresMfa) {
        const result = await loginWithMfaMutation.mutateAsync({
          userId: email,
          token: mfaToken,
        });

        if (result?.accessToken) {
          localStorage.setItem('accessToken', result.accessToken);
          localStorage.setItem('refreshToken', result.refreshToken);
          router.push('/admin');
        }
      } else {
        const result = await loginMutation.mutateAsync({
          email,
          password,
        });

        console.log('[Login Page] Login result:', result);

        if (result?.requiresMFA) {
          setRequiresMfa(true);
        } else if (result?.accessToken) {
          localStorage.setItem('accessToken', result.accessToken);
          localStorage.setItem('refreshToken', result.refreshToken);
          console.log('[Login Page] Tokens stored, redirecting to /admin');
          router.push('/admin');
        } else {
          console.error('[Login Page] Unexpected response structure:', result);
          setError('Login failed - unexpected response');
        }
      }
    } catch (err: any) {
      console.error('[Login Page] Error:', err);
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('admin@shoprewards.local');
    setPassword('ChangeMe123!');
    setIsLoading(true);

    loginMutation.mutate({
      email: 'admin@shoprewards.local',
      password: 'ChangeMe123!',
    }, {
      onSuccess: (result) => {
        if (result?.requiresMFA) {
          setRequiresMfa(true);
          setEmail('admin@shoprewards.local');
        } else if (result?.accessToken) {
          localStorage.setItem('accessToken', result.accessToken);
          localStorage.setItem('refreshToken', result.refreshToken);
          router.push('/admin');
        }
      },
      onError: (err: any) => {
        setError(err.message || 'Demo login failed');
      },
      onSettled: () => {
        setIsLoading(false);
      }
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Premium Branding */}
      <div className="hidden lg:flex lg:w-[35%] xl:w-[40%] 2xl:w-1/2 relative overflow-hidden">
        {/* Elegant gradient background - soft blues, purples, and rose */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #e0e7ff 0%, #ddd6fe 35%, #fce7f3 70%, #f0f9ff 100%)',
          }}
        />

        {/* Animated mesh gradient - soft rose and violet */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-400 rounded-full blur-3xl"
            style={{ animation: 'mesh-move 30s ease-in-out infinite' }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-400 rounded-full blur-3xl"
            style={{ animation: 'mesh-move 30s ease-in-out infinite 10s' }}
          />
        </div>

        {/* Floating particles - golden rose for luxury */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-rose-300 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                animation: `float-up ${20 + Math.random() * 20}s linear infinite`,
                animationDelay: `${Math.random() * 20}s`,
                opacity: 0.4,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div
            className="flex items-center gap-3 mb-12"
            style={{ animation: 'fade-in 0.8s ease-out 0.4s forwards', opacity: 0 }}
          >
            <div className="bg-white/90 backdrop-blur-sm p-2.5 rounded-xl shadow-lg border border-violet-200/50">
              <Gift className="h-7 w-7 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">ShopRewards</h1>
              <p className="text-violet-600 text-sm font-medium">Hub</p>
            </div>
          </div>

          {/* Tagline */}
          <div className="mb-12">
            <h2
              className="text-4xl font-bold text-slate-800 mb-4 leading-tight"
              style={{
                animation: 'fade-slide-up 0.8s ease-out 1s forwards',
                opacity: 0,
              }}
            >
              Retail Rewards
              <br />
              Made Simple
            </h2>
            <p
              className="text-slate-600 text-lg max-w-md"
              style={{ animation: 'fade-slide-up 0.6s ease-out 1.2s forwards', opacity: 0 }}
            >
              Manage customer loyalty programs, digital vouchers, and promotional campaigns across your retail network.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 max-w-md mb-12">
            <div
              className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-violet-200/60 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300"
              style={{ animation: 'slide-in-left 0.6s ease-out 1.4s forwards', opacity: 0 }}
            >
              <Store className="h-6 w-6 text-violet-600 mb-2" />
              <div className="text-2xl font-bold text-slate-800">
                <AnimatedCounter end={500} />+
              </div>
              <div className="text-slate-600 text-sm">Active Shops</div>
            </div>

            <div
              className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-rose-200/60 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300"
              style={{ animation: 'slide-in-right 0.6s ease-out 1.5s forwards', opacity: 0 }}
            >
              <Users className="h-6 w-6 text-rose-600 mb-2" />
              <div className="text-2xl font-bold text-slate-800">
                <AnimatedCounter end={50000} />+
              </div>
              <div className="text-slate-600 text-sm">Happy Customers</div>
            </div>

            <div
              className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-200/60 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300"
              style={{ animation: 'slide-in-left 0.6s ease-out 1.6s forwards', opacity: 0 }}
            >
              <TrendingUp className="h-6 w-6 text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-slate-800">40%</div>
              <div className="text-slate-600 text-sm">More Engagement</div>
            </div>

            <div
              className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-emerald-200/60 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300"
              style={{ animation: 'slide-in-right 0.6s ease-out 1.7s forwards', opacity: 0 }}
            >
              <Shield className="h-6 w-6 text-emerald-600 mb-2" />
              <div className="text-2xl font-bold text-slate-800">100%</div>
              <div className="text-slate-600 text-sm">Secure Platform</div>
            </div>
          </div>

          {/* Testimonial */}
          <div
            className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-violet-200/60 shadow-sm"
            style={{ animation: 'fade-slide-up 0.8s ease-out 2s forwards', opacity: 0 }}
          >
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-slate-700 font-medium mb-3 leading-relaxed">
              "ShopRewards transformed how we manage loyalty programs. Customer engagement increased by 40% in just three months."
            </p>
            <p className="text-violet-600 text-sm font-medium">— Lalatendu Swain, Retail Chain Owner</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="bg-zinc-900 dark:bg-white p-3 rounded-xl">
              <Gift className="h-6 w-6 text-white dark:text-zinc-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold">ShopRewards Hub</h1>
              <p className="text-sm text-muted-foreground">Retail Loyalty Platform</p>
            </div>
          </div>

          {/* Login Card */}
          <div
            className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-0 overflow-hidden"
            style={{ animation: 'fade-slide-up 0.8s ease-out forwards' }}
          >
            {/* Header */}
            <div className="p-8 pb-6">
              <h2
                className="text-3xl font-bold text-center mb-2"
                style={{
                  background: 'linear-gradient(135deg, #18181b 0%, #52525b 50%, #3f3f46 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Welcome Back
              </h2>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                {requiresMfa ? 'Enter your verification code' : 'Sign in to access your dashboard'}
              </p>

              {/* Demo Login Banner */}
              {!requiresMfa && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                  <p className="text-xs text-center text-blue-900 dark:text-blue-200 font-semibold mb-3 flex items-center justify-center gap-1">
                    <Shield className="h-3 w-3" />
                    Try Demo Account - One Click Login
                  </p>
                  <button
                    type="button"
                    onClick={handleDemoLogin}
                    disabled={isLoading}
                    className="w-full py-3 px-4 flex items-center justify-center gap-2 bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-950/50 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-lg transition-all duration-200 disabled:opacity-50"
                  >
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div className="text-center">
                      <p className="text-sm font-bold text-blue-900 dark:text-blue-200">Platform Admin</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">Full System Access</p>
                    </div>
                  </button>
                  <p className="text-xs text-center text-blue-600 dark:text-blue-400 mt-2 font-medium">
                    Click to instantly explore the system
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} method="post" className="space-y-4">
                {!requiresMfa ? (
                  <>
                    {/* Email Field */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full h-12 pl-12 pr-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent transition-all"
                          placeholder="you@example.com"
                          disabled={isLoading}
                          suppressHydrationWarning
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="block w-full h-12 pl-12 pr-12 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent transition-all"
                          placeholder="Enter your password"
                          disabled={isLoading}
                          suppressHydrationWarning
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-500" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* MFA Code Field */
                  <div>
                    <label htmlFor="mfaToken" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      Verification Code
                    </label>
                    <input
                      id="mfaToken"
                      name="mfaToken"
                      type="text"
                      autoComplete="one-time-code"
                      required
                      value={mfaToken}
                      onChange={(e) => setMfaToken(e.target.value)}
                      placeholder="000000"
                      maxLength={6}
                      className="block w-full h-12 px-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white text-center text-lg tracking-wider font-mono placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent transition-all"
                      disabled={isLoading}
                      suppressHydrationWarning
                    />
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 flex items-center justify-center gap-2 text-base font-semibold rounded-xl transition-all relative overflow-hidden group disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #18181b 0%, #3f3f46 50%, #27272a 100%)',
                    backgroundSize: '200% auto',
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 2s linear infinite',
                    }}
                  />
                  <span className="relative z-10 flex items-center gap-2 text-white">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Signing in...
                      </>
                    ) : requiresMfa ? (
                      <>
                        <Shield className="h-5 w-5" />
                        Verify Code
                      </>
                    ) : (
                      <>
                        <Shield className="h-5 w-5" />
                        Sign In
                      </>
                    )}
                  </span>
                </button>

                {requiresMfa && (
                  <button
                    type="button"
                    onClick={() => {
                      setRequiresMfa(false);
                      setMfaToken('');
                      setError('');
                    }}
                    className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    ← Back to sign in
                  </button>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <Shield className="h-3 w-3 text-green-600" />
                <span>Protected by 256-bit SSL encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keyframes in style tag */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes mesh-move {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes float-up {
          0% {
            transform: translateY(100vh);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100vh);
            opacity: 0;
          }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
