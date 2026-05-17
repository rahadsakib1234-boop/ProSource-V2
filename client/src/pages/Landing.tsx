import React from 'react'
import { Link } from 'wouter'
import { CheckCircle, ArrowRight, LayoutDashboard, Users, BarChart3, Zap } from 'lucide-react'

const Landing = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
          <span className="text-xl font-bold tracking-tight">ProSource CRM</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/app/register">
            <button className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Login</button>
          </Link>
          <Link href="/app/register">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-all shadow-sm">
              Get Started Free
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="px-6 pt-20 pb-32 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold mb-6 border border-indigo-100">
          <Zap size={12} />
          <span>Next Generation Sourcing Intelligence</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
          The CRM built for <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Sourcing Professionals</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Stop fighting with generic CRMs. ProSource provides industry-specific blueprints,
          AI-driven lead analysis, and local-first speed to help you close more deals.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/app/register">
            <button className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
              Start Your Free Trial <ArrowRight size={20} />
            </button>
          </Link>
          <button className="w-full sm:w-auto bg-white text-slate-600 border border-slate-200 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-slate-50 transition-all">
            View Demo
          </button>
        </div>
      </header>

      {/* Features Grid */}
      <section className="bg-slate-50 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to scale</h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Engineered for the specific complexities of sourcing businesses, not generic sales.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<LayoutDashboard className="text-indigo-600" />}
              title="Industry Blueprints"
              description="Pre-configured workflows and data fields tailored to your specific industry sourcing needs."
            />
            <FeatureCard
              icon={<Users className="text-indigo-600" />}
              title="Lead Intelligence"
              description="AI-powered analysis that suggests the best next steps to convert leads into loyal clients."
            />
            <FeatureCard
              icon={<BarChart3 className="text-indigo-600" />}
              title="Financial Tracking"
              description="Professional invoicing and product cost tracking with multi-currency support built-in."
            />
          </div>
        </div>
      </section>

      {/* Pricing-ish Section (simplified) */}
      <section className="py-24 px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-12">Simple, Transparent Pricing</h2>
        <div className="bg-white border-2 border-indigo-600 rounded-3xl p-8 shadow-xl relative overflow-hidden max-w-md mx-auto">
          <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1 text-xs font-bold rounded-bl-xl">
            MOST POPULAR
          </div>
          <h3 className="text-2xl font-bold mb-2">Pro Plan</h3>
          <div className="text-4xl font-black mb-6">$49<span className="text-lg text-slate-500 font-normal">/mo</span></div>
          <ul className="text-left space-y-4 mb-8">
            <li className="flex items-center gap-3 text-slate-600">
              <CheckCircle size={18} className="text-indigo-600" />
              Unlimited Clients & Leads
            </li>
            <li className="flex items-center gap-3 text-slate-600">
              <CheckCircle size={18} className="text-indigo-600" />
              All Industry Blueprints
            </li>
            <li className="flex items-center gap-3 text-slate-600">
              <CheckCircle size={18} className="text-indigo-600" />
              AI-Powered Business Intelligence
            </li>
            <li className="flex items-center gap-3 text-slate-600">
              <CheckCircle size={18} className="text-indigo-600" />
              Professional Invoicing
            </li>
          </ul>
          <Link href="/app/register">
            <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all">
              Get Started Now
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-12 px-6 max-w-7xl mx-auto text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} ProSource CRM. All rights reserved.</p>
      </footer>
    </div>
  )
}

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-indigo-200 transition-all shadow-sm group">
    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
)

export default Landing
