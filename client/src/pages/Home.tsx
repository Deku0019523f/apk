import { useState, useEffect } from "react";
import { MessageCircle, Send, CheckCircle2, ArrowRight } from "lucide-react";

// Channel data
const channels = [
  {
    id: "whatsapp-chain",
    name: "Chaîne WhatsApp",
    description: "Rejoignez notre chaîne officielle WhatsApp pour les actualités et mises à jour exclusives de Royal PCS.",
    icon: MessageCircle,
    link: "https://chat.whatsapp.com/YOUR_WHATSAPP_LINK",
    color: "from-green-600 to-green-700",
    badge: "Officiel",
    badgeColor: "bg-green-100 text-green-800",
    delay: "0ms"
  },
  {
    id: "telegram",
    name: "Canal Telegram",
    description: "Suivez notre canal Telegram pour recevoir toutes les informations importantes en temps réel.",
    icon: Send,
    link: "https://t.me/YOUR_TELEGRAM_LINK",
    color: "from-sky-500 to-sky-700",
    badge: "Notifications",
    badgeColor: "bg-sky-100 text-sky-800",
    delay: "100ms"
  },
  {
    id: "whatsapp-montante",
    name: "Groupe WhatsApp Montante",
    description: "Intégrez notre groupe WhatsApp dédié aux montantes pour échanger et progresser ensemble.",
    icon: MessageCircle,
    link: "https://chat.whatsapp.com/YOUR_MONTANTE_LINK",
    color: "from-emerald-600 to-emerald-700",
    badge: "Montante",
    badgeColor: "bg-emerald-100 text-emerald-800",
    delay: "200ms"
  }
];

// Steps data
const steps = [
  {
    number: "1",
    title: "Choisissez votre option",
    description: "Sélectionnez le canal qui vous convient : Chaîne WhatsApp, Canal Telegram, ou Groupe WhatsApp pour les montantes.",
    icon: CheckCircle2,
    delay: "0ms"
  },
  {
    number: "2",
    title: "Accédez aux liens",
    description: "Cliquez sur les trois points en haut à droite de votre écran pour accéder aux options.",
    icon: MessageCircle,
    delay: "100ms"
  },
  {
    number: "3",
    title: "Ouvrez dans le navigateur",
    description: 'Sélectionnez "Ouvrir dans le navigateur" pour accéder au lien depuis votre application.',
    icon: ArrowRight,
    delay: "200ms"
  },
  {
    number: "4",
    title: "Rejoignez-nous !",
    description: "Vous êtes maintenant prêt à rejoindre l'un de nos canaux Royal PCS. Bienvenue dans la communauté !",
    icon: CheckCircle2,
    delay: "300ms"
  }
];

export default function Home( ) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="py-6 px-4 text-center border-b border-gray-200">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-500"></div>
          <span className="font-bold text-sm tracking-widest uppercase" style={{ color: "hsl(44, 63%, 52%)", fontFamily: "Lora, serif" }}>
            Royal PCS
          </span>
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-500"></div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4 text-center" style={{ background: "hsl(220, 14%, 94%)" }}>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "Lora, serif", color: "hsl(213, 56%, 23%)" }}>
            Rejoignez nos canaux Royal PCS !
          </h1>
          <p className="text-sm md:text-base leading-relaxed mb-6" style={{ color: "hsl(213, 30%, 65%)" }}>
            Cliquez sur les différents liens pour rejoindre les différents canaux de Royal PCS.
          </p>
          <p className="text-sm md:text-base leading-relaxed" style={{ color: "hsl(213, 30%, 65%)" }}>
            Pour bénéficier de nos avantages, suivez ces quelques étapes simples :
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-px w-24" style={{ background: "hsl(44, 63%, 52% / 0.5)" }}></div>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(44, 63%, 52%)" }}></div>
            <div className="h-px w-24" style={{ background: "hsl(44, 63%, 52% / 0.5)" }}></div>
          </div>
        </div>
      </section>

      {/* Step 1 - Choose Channel */}
      <section className="py-12 px-4" style={{ background: "hsl(220, 14%, 94%)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: "Lora, serif", color: "hsl(213, 56%, 23%)" }}>
              Étape 1 — Choisissez votre canal
            </h3>
            <p className="text-muted-foreground text-base" style={{ color: "hsl(213, 30%, 65%)" }}>
              Sélectionnez parmi nos trois canaux officiels
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {channels.map((channel, idx) => {
              const IconComponent = channel.icon;
              return (
                <div
                  key={channel.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-200"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(20px)",
                    transition: `opacity 0.6s ease-out ${idx * 120}ms, transform 0.6s ease-out ${idx * 120}ms`
                  }}
                >
                  <div className={`bg-gradient-to-br ${channel.color} p-6 flex flex-col items-center text-center`}>
                    <div className="mb-3 p-2 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <IconComponent size={40} className="text-white" />
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full mb-2 ${channel.badgeColor}`}>
                      {channel.badge}
                    </span>
                    <h4 className="text-white text-lg font-bold leading-tight">
                      {channel.name}
                    </h4>
                  </div>
                  <div className="p-5 flex flex-col gap-4">
                    <p className="text-muted-foreground text-sm leading-relaxed text-center" style={{ color: "hsl(213, 30%, 65%)" }}>
                      {channel.description}
                    </p>
                    <a
                      href={channel.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl py-3 px-5 text-sm font-bold no-underline"
                      style={{ background: "hsl(44, 63%, 52%)", color: "white" }}
                    >
                      Rejoindre maintenant
                      <ArrowRight size={16} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Step 2 - How to Join */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px flex-1 max-w-[80px]" style={{ background: "hsl(44, 63%, 52%)" }}></div>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-500"></div>
              <div className="h-px flex-1 max-w-[80px]" style={{ background: "hsl(44, 63%, 52%)" }}></div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: "Lora, serif", color: "hsl(213, 56%, 23%)" }}>
              Comment rejoindre nos canaux
            </h3>
            <p className="text-muted-foreground" style={{ color: "hsl(213, 30%, 65%)" }}>
              C'est simple et rapide pour profiter de tous nos contenus !
            </p>
          </div>

          <div className="space-y-5">
            {steps.map((step, idx) => {
              const IconComponent = step.icon;
              return (
                <div
                  key={step.number}
                  className="flex items-start gap-5 bg-gray-50 rounded-2xl p-5 border border-gray-200 shadow-sm"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateX(0)" : "translateX(-20px)",
                    transition: `opacity 0.6s ease-out ${200 + idx * 100}ms, transform 0.6s ease-out ${200 + idx * 100}ms`
                  }}
                >
                  <div className="shrink-0 mt-0.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: "hsl(213, 56%, 23%)" }}
                    >
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <IconComponent size={20} style={{ color: "hsl(213, 56%, 23%)" }} />
                      <h4 className="font-bold text-base md:text-lg" style={{ color: "hsl(213, 56%, 23%)" }}>
                        Étape {step.number} : {step.title}
                      </h4>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed" style={{ color: "hsl(213, 30%, 65%)" }}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl p-6 text-center" style={{ background: "linear-gradient(135deg, hsl(213, 56%, 23%), hsl(213, 56%, 30%))" }}>
            <div className="flex justify-center mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-500"></div>
            </div>
            <p className="text-white text-base md:text-lg font-semibold" style={{ fontFamily: "Lora, serif" }}>
              C'est simple et rapide pour profiter de tous nos contenus !
            </p>
            <p className="mt-1 text-sm" style={{ color: "hsl(213, 30%, 75%)" }}>
              Bienvenue dans la communauté Royal PCS.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 text-center" style={{ background: "hsl(213, 56%, 23%)" }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-amber-500"></div>
          <span className="font-bold text-sm tracking-widest uppercase" style={{ color: "hsl(44, 63%, 52%)", fontFamily: "Lora, serif" }}>
            ROYAL PCS
          </span>
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-amber-500"></div>
        </div>
        <p className="text-xs" style={{ color: "hsl(213, 30%, 60%)" }}>
          © {new Date().getFullYear()} Royal PCS · Tous droits réservés
        </p>
      </footer>
    </div>
  );
}
