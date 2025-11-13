import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import SEOHelmet from '@/components/SEOHelmet';
import {
  Package,
  TrendingUp,
  Users,
  Building2,
  BarChart3,
  Shield,
  Clock,
  Check,
  Star,
  MessageCircle,
  X,
  Moon,
  Sun,
  Zap,
  ShoppingCart,
  DollarSign,
  FileText,
  ArrowRight,
  Send,
} from 'lucide-react';

const Index = () => {
  // ALL HOOKS AT THE TOP — NEVER SKIP
  const { isAuthenticated, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  // useEffects — also hooks, must be before any return
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (showChat && chatInputRef.current) {
      chatInputRef.current.focus();
    }
  }, [showChat]);

  // EARLY RETURNS — AFTER ALL HOOKS
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  // REST OF COMPONENT LOGIC (safe to define after early returns)
  const stats = [
    { label: 'Happy Clients', value: '2,500+', icon: Users },
    { label: 'Businesses Registered', value: '1,200+', icon: Building2 },
    { label: 'Products Tracked', value: '500K+', icon: Package },
    { label: 'Uptime', value: '99.9%', icon: Clock },
  ];

  const features = [
    {
      icon: Package,
      title: 'Inventory Management',
      description: 'Track products in real-time with automated stock alerts and expiry notifications.',
    },
    {
      icon: ShoppingCart,
      title: 'Sales Tracking',
      description: 'Monitor sales performance, payment methods, and customer credit management.',
    },
    {
      icon: DollarSign,
      title: 'Financial Reports',
      description: 'Generate comprehensive reports on profits, losses, and business performance.',
    },
    {
      icon: Users,
      title: 'Employee Management',
      description: 'Manage staff, assign roles, and track employee performance across branches.',
    },
    {
      icon: Building2,
      title: 'Multi-Branch Support',
      description: 'Manage multiple locations with centralized control and branch-specific insights.',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Visualize key metrics and make data-driven decisions with powerful analytics.',
    },
  ];
const imageCards = [
  {
    icon: Package,
    title: 'Kugenzura Stok ako kanya',
    description: 'Ntuzongere kubura ibicuruzwa kubera ibimenyesha n’amakuru yihuta.',
  },
  {
    icon: ShoppingCart,
    title: 'Kugurisha byihuse kandi byoroshye',
    description: 'Tanga serivisi vuba ukoresheje POS n’ikorana na barikodi.',
  },
  {
    icon: BarChart3,
    title: 'Isesengura ry’ubucuruzi',
    description: 'Menya uko ubucuruzi buhagaze buri munsi, icyumweru, cyangwa ukwezi.',
  },
  {
    icon: Users,
    title: 'Kuyobora abakozi',
    description: 'Tanga inshingano, ukurikirane imikorere, kandi uyobore amashami yose.',
  },
  {
    icon: Building2,
    title: 'Guhuza amashami menshi',
    description: 'Menyesha amakuru yose ku gihe mu mashami yawe yose.',
  },
  {
    icon: DollarSign,
    title: 'Raporo z’inyungu n’igihombo',
    description: 'Sobanukirwa imari yawe ukoresheje raporo z’amafaranga n’andi makuru.',
  },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: 'Ubuntu',
    period: 'Ukwezi kwa mbere',
    description: 'Byiza ku bacuruzi batangiye urugendo rw’ikoranabuhanga.',
    features: [
      'Konti 1 ya admin',
      'Ibicuruzwa kugeza ku 1,000',
      'Ishami 1',
      'Konti z’abakozi 5',
      'Raporo z’auto 10',
      'Kubika amakuru muri Cloud',
      'Raporo zisanzwe',
      'Gusubiramo ijambo ry’ibanga ubuntu',
      'Ubufasha bwo kuri imeri',
      'Kubikoresha kuri telefoni',
    ],
    popular: false,
  },
  {
    name: 'Professional',
    price: '10,000',
    period: 'ku kwezi',
    description: 'Bikwiranye n’abacuruzi bari gukura bafite amashami menshi.',
    features: [
      'Ibicuruzwa kugeza ku 10,000',
      'Amashami 5',
      'Konti z’abakozi 25',
      'Isesengura ryisumbuye',
      'Ubufasha bwihuse',
      'Porogaramu za telefoni na mudasobwa',
      'Kuyobora abatanga ibicuruzwa',
      'Raporo zihariye',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '100,000',
    period: 'ku mwaka',
    description: 'Ku bigo binini bifite ibisabwa byinshi n’imikorere ihanitse.',
    features: [
      'Ibicuruzwa bitagira umupaka',
      'Amashami yose ushaka',
      'Abakozi batagira umupaka',
      'Isesengura rishingiye kuri AI',
      'Ubufasha buhoraho amasaha 24/7',
      'Guhuza na sisiteme zindi',
      'Umutekano wisumbuye',
      'Amahugurwa n’itangira ryihuse',
    ],
    popular: false,
  },
];



  const trustedBy = [
    'KigaliMart',
    'Rwanda Retail',
    'City Express',
    'Prime Stores',
    'Modern Market',
    'Fresh Foods Rwanda',
  ];

  const streamChat = async (userMessage: string) => {
    setIsLoading(true);
    const userMsg = { role: 'user' as const, content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    setChatMessage('');

    let assistantContent = '';
    const assistantMsgIndex = messages.length + 1;

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/customer-support-chat`;
      
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!resp.ok) {
        const error = await resp.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || 'Failed to get response');
      }

      if (!resp.body) throw new Error('No response body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                if (newMessages[assistantMsgIndex]?.role === 'assistant') {
                  newMessages[assistantMsgIndex] = {
                    ...newMessages[assistantMsgIndex],
                    content: assistantContent,
                  };
                } else {
                  newMessages.push({ role: 'assistant', content: assistantContent });
                }
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again or contact our support team.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatMessage.trim() && !isLoading) {
      streamChat(chatMessage.trim());
    }
  };

  return (
    <>
      <SEOHelmet
        title="StockWise - Smart Inventory & Business Management System | Rwanda"
        description="StockWise is a powerful inventory management system for businesses in Rwanda. Track products, manage sales, monitor finances, and grow your business with real-time analytics and multi-branch support."
        keywords="StockWise Rwanda, inventory management Rwanda, business management system, product tracking Rwanda, sales management, financial reports, POS system Rwanda, retail management"
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">StockWise</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </Button>
              <Button variant="outline" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button onClick={() => navigate('/register')}>Get Started</Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
<section className="py-20 md:py-32 px-4 overflow-hidden">
  <div className="container mx-auto">
    <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
      {/* Left: Text & CTA */}
      <div className="text-center lg:text-left">
        <Badge className="mb-6 px-4 py-1" variant="secondary">
          Trusted by 1,200+ businesses in Rwanda
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
          Smart Inventory Management
          <span className="text-primary"> Made Simple</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto lg:mx-0">
         Teza imbere imikorere y’ubucuruzi bwawe ukoresheje StockWise. Kurikirana ibicuruzwa, tegeka kugurisha, menya imari, kandi uteze imbere ubucuruzi bwawe ukoresheje raporo n’isesengura ryimbitse.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <Button size="lg" className="text-lg px-8" onClick={() => navigate('/register')}>
            Tangira k'ubuntu<ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8" onClick={() => navigate('/login')}>
            Ufite konti? Injira<ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Right: Auto-Scrolling Image Cards */}
      <div className="relative h-[500px] overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10 pointer-events-none" />
        
        <div className="animate-scroll-up space-y-6 py-6">
          {/* Duplicate set for seamless loop */}
          {[...imageCards, ...imageCards].map((card, index) => (
            <div
              key={`${card.title}-${index}`}
              className="bg-card border border-border/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <card.icon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{card.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</section>

        {/* Stats Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6 pb-6">
                    <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                    <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="py-12 px-4">
          <div className="container mx-auto text-center">
            <p className="text-sm text-muted-foreground mb-6">TRUSTED BY LEADING BUSINESSES</p>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {trustedBy.map((company, index) => (
                <div key={index} className="text-lg font-semibold text-muted-foreground/60 hover:text-foreground transition-colors">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4" variant="secondary">
                Features
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Powerful features designed to help you manage your business efficiently and grow faster.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4" variant="secondary">
                Pricing
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Choose the perfect plan for your business. All prices in RWF.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <Card
                  key={index}
                  className={`relative ${plan.popular ? 'border-primary shadow-xl scale-105' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1">
                        <Star className="w-3 h-3 mr-1 inline" /> Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                    <div className="text-muted-foreground text-sm mb-4">{plan.description}</div>
                    <div className="text-4xl font-bold text-foreground">
                      {plan.price === 'Custom' ? (
                        <span className="text-3xl">Custom</span>
                      ) : (
                        <>
                          <span className="text-lg text-muted-foreground">RWF</span> {plan.price}
                        </>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{plan.period}</div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={plan.popular ? 'default' : 'outline'}
                      onClick={() => navigate('/register')}
                    >
                      {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Security & Trust Section */}
        <section id="about" className="py-20 px-4">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
              <div>
                <Badge className="mb-4" variant="secondary">
                  Security & Trust
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Your Data is Safe With Us
                </h2>
                <p className="text-muted-foreground mb-6">
                  We take security seriously. StockWise uses enterprise-grade encryption and follows industry best practices to keep your business data secure.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <div className="font-semibold text-foreground">256-bit Encryption</div>
                      <div className="text-sm text-muted-foreground">All data encrypted in transit and at rest</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <div className="font-semibold text-foreground">Regular Backups</div>
                      <div className="text-sm text-muted-foreground">Automated daily backups with 30-day retention</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <div className="font-semibold text-foreground">99.9% Uptime SLA</div>
                      <div className="text-sm text-muted-foreground">Reliable infrastructure you can depend on</div>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">100%</div>
                    <div className="text-sm text-muted-foreground">Data Privacy</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">24/7</div>
                    <div className="text-sm text-muted-foreground">Monitoring</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">2.5K+</div>
                    <div className="text-sm text-muted-foreground">Active Users</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">98%</div>
                    <div className="text-sm text-muted-foreground">Satisfaction</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto text-center max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl mb-8 text-primary-foreground/90">
              Join 1,200+ businesses already using StockWise to manage their inventory and boost profits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8" onClick={() => navigate('/register')}>
                Start Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                onClick={() => setShowChat(true)}
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border bg-muted/30 py-12 px-4">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="text-xl font-bold text-foreground">StockWise</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Smart inventory management for modern businesses in Rwanda.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-4">Product</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                      Security
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-4">Company</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#about" className="text-sm text-muted-foreground hover:text-foreground">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                      Careers
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-4">Support</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                      Contact
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                      Privacy
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
              © 2025 StockWise. All rights reserved. Made in Rwanda
            </div>
          </div>
        </footer>

        {/* AI Chat Widget */}
        {showChat && (
          <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-card border border-border rounded-xl shadow-2xl z-50 flex flex-col">
            <div className="bg-primary text-primary-foreground p-4 rounded-t-xl flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <span className="font-semibold">StockWise Support</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setShowChat(false);
                  setMessages([]);
                }}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Hi! I'm your StockWise assistant. How can I help you today?
                  </p>
                </div>
                
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-8'
                        : 'bg-muted text-foreground mr-8'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="bg-muted p-3 rounded-lg mr-8">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border flex-shrink-0">
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <textarea
                  ref={chatInputRef}
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleChatSubmit(e);
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1 p-3 border border-input rounded-lg bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={2}
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="h-full px-4"
                  disabled={isLoading || !chatMessage.trim()}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Floating Chat Button */}
        {!showChat && (
          <Button
            onClick={() => setShowChat(true)}
            className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-2xl z-40"
            size="icon"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        )}
      </div>
    </>
  );
};

export default Index;