import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import useAuthStore from '../store/authStore';
import { Cpu, GitBranch, Activity, Plug, ArrowRight, Zap } from 'lucide-react';

const FEATURES = [
  {
    icon: Cpu,
    title: 'AI Workflow Generation',
    description:
      'Describe your workflow in plain English and let AI generate the entire execution graph automatically.',
    gradient: 'from-primary-500 to-primary-600',
  },
  {
    icon: GitBranch,
    title: 'Multi-Agent Orchestration',
    description:
      'Coordinate multiple AI agents working together with branching, parallel execution, and conditional logic.',
    gradient: 'from-accent-500 to-accent-600',
  },
  {
    icon: Activity,
    title: 'Real-Time Monitoring',
    description:
      'Watch your workflows execute live with detailed logs, metrics, and instant failure alerts.',
    gradient: 'from-warning-400 to-warning-500',
  },
  {
    icon: Plug,
    title: 'Seamless Integrations',
    description:
      'Connect to any API, database, or third-party service with pre-built and custom integration nodes.',
    gradient: 'from-danger-400 to-danger-500',
  },
];

const STEPS = [
  {
    number: '1',
    title: 'Describe Your Workflow',
    description:
      'Tell the AI what you want to accomplish in natural language — no coding required.',
  },
  {
    number: '2',
    title: 'AI Generates the Graph',
    description:
      'Watch as AI creates an optimized workflow graph with intelligent agent nodes and connections.',
  },
  {
    number: '3',
    title: 'Execute & Monitor',
    description:
      'Run your workflow with one click and monitor progress in real-time with detailed analytics.',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (token) {
      router.push('/dashboard');
    }
  }, [token, router]);

  return (
    <>
      <Head>
        <title>AgentFlow AI — Intelligent Workflow Automation</title>
        <meta
          name="description"
          content="Build, orchestrate, and monitor intelligent AI agent workflows with a visual drag-and-drop builder. No coding required."
        />
      </Head>

      <div className="min-h-screen bg-dark-900 relative overflow-hidden">
        {/* ───── Floating Gradient Orbs ───── */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary-500/10 blur-[120px] animate-float" />
          <div
            className="absolute top-1/3 -right-32 w-[400px] h-[400px] rounded-full bg-accent-500/8 blur-[100px] animate-float"
            style={{ animationDelay: '2s' }}
          />
          <div
            className="absolute bottom-20 left-1/4 w-[350px] h-[350px] rounded-full bg-primary-600/8 blur-[100px] animate-float"
            style={{ animationDelay: '4s' }}
          />
          <div
            className="absolute top-2/3 right-1/3 w-[250px] h-[250px] rounded-full bg-warning-400/5 blur-[80px] animate-float"
            style={{ animationDelay: '3s' }}
          />
        </div>

        {/* ───── HERO ───── */}
        <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-gray-300 mb-8 animate-fade-in">
            <Zap className="w-4 h-4 text-primary-400" />
            <span>Powered by Advanced AI Agents</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-tight animate-fade-in">
            <span className="text-white">Automate with</span>
            <br />
            <span className="gradient-text">AI Agents</span>
          </h1>

          <p
            className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl leading-relaxed animate-fade-in"
            style={{ animationDelay: '0.15s' }}
          >
            Design, orchestrate, and monitor intelligent multi-agent workflows
            using a visual builder. Describe what you need — AI handles the rest.
          </p>

          {/* CTA Buttons */}
          <div
            className="mt-10 flex flex-col sm:flex-row items-center gap-4 animate-fade-in"
            style={{ animationDelay: '0.3s' }}
          >
            <Link
              href="/register"
              className="btn-primary flex items-center gap-2 text-lg px-8 py-4"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="btn-secondary flex items-center gap-2 text-lg px-8 py-4"
            >
              Sign In
            </Link>
          </div>

          {/* Animated glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-500/5 blur-[150px] animate-pulse-glow pointer-events-none" />
        </section>

        {/* ───── FEATURES ───── */}
        <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Powerful tools to build, deploy, and manage AI-driven workflows at
              scale.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="glass-card group cursor-default animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ───── HOW IT WORKS ───── */}
        <section className="relative z-10 max-w-4xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Three simple steps from idea to execution.
            </p>
          </div>

          <div className="relative flex flex-col gap-12">
            {/* Dashed connector line */}
            <div className="hidden md:block absolute left-[39px] top-10 bottom-10 w-px border-l-2 border-dashed border-white/10" />

            {STEPS.map((step, i) => (
              <div
                key={step.number}
                className="flex items-start gap-6 animate-fade-in"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/25 relative z-10">
                  <span className="text-2xl font-extrabold text-white">
                    {step.number}
                  </span>
                </div>
                <div className="pt-2">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ───── FOOTER ───── */}
        <footer className="relative z-10 border-t border-white/5 py-10">
          <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-500">
              <Zap className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-medium">Built with AI</span>
            </div>
            <p className="text-sm text-gray-600">
              &copy; {new Date().getFullYear()} AgentFlow AI. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
