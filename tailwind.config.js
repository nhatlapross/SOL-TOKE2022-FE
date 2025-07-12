//hookswap-frontend\tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // HookSwap custom colors
        'hookswap-purple': 'var(--hookswap-purple)',
        'hookswap-blue': 'var(--hookswap-blue)',
        'hookswap-indigo': 'var(--hookswap-indigo)',
        'hookswap-pink': 'var(--hookswap-pink)',
        'hookswap-cyan': 'var(--hookswap-cyan)',
        'hookswap-green': 'var(--hookswap-green)',
        'hookswap-orange': 'var(--hookswap-orange)',
        'hookswap-red': 'var(--hookswap-red)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "gradient-shift": "gradient-shift 3s ease infinite",
        "shimmer": "shimmer 1.5s infinite",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fadeIn": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slideUp": {
          from: {
            transform: "translateY(20px)",
            opacity: "0",
          },
          to: {
            transform: "translateY(0)",
            opacity: "1",
          },
        },
        "slideDown": {
          from: {
            transform: "translateY(-20px)",
            opacity: "0",
          },
          to: {
            transform: "translateY(0)",
            opacity: "1",
          },
        },
        "scaleIn": {
          from: {
            transform: "scale(0.9)",
            opacity: "0",
          },
          to: {
            transform: "scale(1)",
            opacity: "1",
          },
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "var(--shadow-glow)",
          },
          "50%": {
            boxShadow: "0 0 40px rgba(139, 92, 246, 0.6)",
          },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
      boxShadow: {
        'glow': 'var(--shadow-glow)',
        'glow-blue': 'var(--shadow-glow-blue)',
        'glow-pink': 'var(--shadow-glow-pink)',
        'glow-green': 'var(--shadow-glow-green)',
      },
      zIndex: {
        'dropdown': '1000',
        'sticky': '1010',
        'fixed': '1020',
        'modal-backdrop': '9998',
        'modal': '9999',
        'popover': '10000',
        'tooltip': '10001',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      aspectRatio: {
        'golden': '1.618',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Custom plugin for glass morphism
    function({ addUtilities }) {
      const newUtilities = {
        '.glass-effect': {
          background: 'var(--glass-bg)',
          'backdrop-filter': 'var(--glass-backdrop)',
          '-webkit-backdrop-filter': 'var(--glass-backdrop)',
          border: '1px solid var(--glass-border)',
        },
        '.glass-light': {
          background: 'var(--glass-bg-light)',
          'backdrop-filter': 'var(--glass-backdrop-light)',
          '-webkit-backdrop-filter': 'var(--glass-backdrop-light)',
          border: '1px solid var(--glass-border-light)',
        },
        '.text-gradient': {
          background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 50%, #6366f1 100%)',
          'background-size': '200% 200%',
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          animation: 'gradient-shift 3s ease infinite',
        },
        '.bg-gradient-primary': {
          background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 50%, #6366f1 100%)',
        },
        '.bg-gradient-secondary': {
          background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
        },
        '.hover-lift': {
          transition: 'transform 0.2s ease-out',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        '.hover-glow': {
          transition: 'all 0.3s ease-out',
          '&:hover': {
            'box-shadow': 'var(--shadow-glow)',
            transform: 'translateY(-1px)',
          },
        },
      };
      addUtilities(newUtilities);
    },
  ],
};