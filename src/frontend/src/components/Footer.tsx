import { Facebook, Instagram, Twitter } from "lucide-react";

const SOCIAL = [
  { Icon: Twitter, label: "Twitter" },
  { Icon: Instagram, label: "Instagram" },
  { Icon: Facebook, label: "Facebook" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined"
      ? encodeURIComponent(window.location.hostname)
      : "";

  const cols = [
    {
      title: "DOITEPIC",
      links: ["Dashboard", "Food Log", "Metrics", "Reports"],
    },
    {
      title: "Features",
      links: [
        "Calorie Tracking",
        "Macro Analysis",
        "Water Intake",
        "Meal Quality",
      ],
    },
    {
      title: "Resources",
      links: [
        "Nutrition Guide",
        "Healthy Recipes",
        "Food Database",
        "Health Tips",
      ],
    },
    {
      title: "Company",
      links: ["About", "Privacy Policy", "Terms of Use", "Contact"],
    },
  ];

  return (
    <footer className="bg-doitepic-footer text-sidebar-foreground mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <span className="text-sm text-sidebar-foreground/60 cursor-pointer hover:text-sidebar-foreground/90 transition-colors">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/assets/uploads/file_0000000091b4720b8ab0302490c69f98-1.png"
              alt="DoitEpic"
              className="h-6 w-auto object-contain"
            />
            <span className="text-sm text-sidebar-foreground/60">
              © {year}. Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                caffeine.ai
              </a>
            </span>
          </div>
          <div className="flex items-center gap-3">
            {SOCIAL.map(({ Icon, label }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Icon size={14} className="text-sidebar-foreground/70" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
