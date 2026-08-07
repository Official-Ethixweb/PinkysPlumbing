import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'motion/react';
import {
  Send,
  CheckCircle2,
  Phone,
  Loader2,
  User,
  Mail,
  MapPin,
  MessageSquare,
  CircleCheck,
  AlertTriangle,
  HelpCircle,
  type LucideIcon
} from 'lucide-react';
import { contactSchema, OTHER_SERVICE, type ContactFormValues } from '../../lib/contactSchema';
import { zodResolver } from '../../lib/zodResolver';
import { business } from '../../data/business';
import { services } from '../../data/services';
import SpecularButton from './SpecularButton';
import { specularPink } from '../../lib/specularPresets';
import { serviceIconMap } from '../../lib/serviceIcons';
import type { ImageMetadata } from 'astro';

// The 8 real services resolve to the custom pink/teal SVG pair (only the
// resting `.default` art makes sense in this small radio-tile context -
// there's no hover-swap here, each tile is either selected or not). The two
// catch-all tiles have no custom artwork, so they keep their Lucide icons.
// `icon` therefore holds two different shapes; `'src' in icon` at render
// time is what tells the two apart.
const serviceTiles = [
  ...services.map((s) => ({ title: s.title, icon: serviceIconMap[s.icon].default })),
  { title: 'Emergency / Not Sure', icon: AlertTriangle },
  { title: OTHER_SERVICE, icon: HelpCircle }
];

const fieldBase =
  'w-full rounded-2xl border border-ink-200 bg-white py-3.5 text-[15px] text-ink-900 placeholder:text-ink-400 outline-none transition-colors focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10';
const errorBase = 'border-red-500/60 focus:border-red-500';
const labelBase = 'mb-1.5 block text-sm font-semibold text-ink-700';
const errorText = 'mt-1.5 text-xs font-medium text-red-600';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sent'>('idle');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormValues>({ resolver: zodResolver(contactSchema) });

  const selectedService = watch('service');

  const onSubmit = handleSubmit(async (data) => {
    const serviceLine = data.service === OTHER_SERVICE ? `Something else: ${data.otherService}` : data.service;
    const subject = `New service request: ${serviceLine} (${data.name})`;
    const body = [
      `Name: ${data.name}`,
      `Phone: ${data.phone}`,
      `Email: ${data.email}`,
      `City: ${data.city}`,
      `Service needed: ${serviceLine}`,
      '',
      data.message
    ].join('\n');

    // No backend is wired up yet. This hands the fully-validated request
    // off to the visitor's email client. Swap for a POST to a real
    // endpoint (Vercel function + Resend/SendGrid, or Formspree/Web3Forms)
    // once one exists; the validation layer above won't need to change.
    window.location.href = `mailto:${business.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    await new Promise((r) => setTimeout(r, 400));
    setStatus('sent');
  });

  if (status === 'sent') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        className="flex flex-col items-center gap-4 rounded-3xl border border-teal-500/25 bg-teal-50 p-10 text-center"
      >
        <CheckCircle2 className="size-12 text-teal-700" aria-hidden="true" />
        <h3 className="font-display text-ink-900 text-xl font-bold">Your email app should be open now</h3>
        <p className="text-ink-600 max-w-sm text-sm">
          Hit send there to reach our office. Need it handled right this second instead?
        </p>
        <SpecularButton href={`tel:${business.hotline.tel}`} size="md" {...specularPink}>
          <Phone className="size-4" aria-hidden="true" />
          Call {business.hotline.display}
        </SpecularButton>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelBase}>
            Full Name
          </label>
          <div className="relative">
            <User
              className="text-ink-400 pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              id="name"
              type="text"
              autoComplete="name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className={`${fieldBase} pr-4 pl-11 ${errors.name ? errorBase : ''}`}
              {...register('name')}
            />
          </div>
          {errors.name && (
            <p id="name-error" className={errorText}>
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className={labelBase}>
            Phone Number
          </label>
          <div className="relative">
            <Phone
              className="text-ink-400 pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
              className={`${fieldBase} pr-4 pl-11 ${errors.phone ? errorBase : ''}`}
              {...register('phone')}
            />
          </div>
          {errors.phone && (
            <p id="phone-error" className={errorText}>
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={labelBase}>
            Email Address
          </label>
          <div className="relative">
            <Mail
              className="text-ink-400 pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={`${fieldBase} pr-4 pl-11 ${errors.email ? errorBase : ''}`}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p id="email-error" className={errorText}>
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="city" className={labelBase}>
            City
          </label>
          <div className="relative">
            <MapPin
              className="text-ink-400 pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              id="city"
              type="text"
              autoComplete="address-level2"
              aria-invalid={!!errors.city}
              aria-describedby={errors.city ? 'city-error' : undefined}
              className={`${fieldBase} pr-4 pl-11 ${errors.city ? errorBase : ''}`}
              {...register('city')}
            />
          </div>
          {errors.city && (
            <p id="city-error" className={errorText}>
              {errors.city.message}
            </p>
          )}
        </div>
      </div>

      <fieldset>
        <legend className={labelBase}>What Do You Need?</legend>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {serviceTiles.map(({ title, icon }) => {
            // `typeof` cannot discriminate these two: Astro's .svg asset
            // import is a callable Astro component FACTORY (typeof
            // 'function' - meta like `.src` is Object.assign'd onto the
            // factory itself, not returned as a separate plain object), and
            // lucide-react v1 icons are forwardRef-wrapped objects (typeof
            // 'object', not 'function' either). `.src` is the one property
            // unique to the SVG import, so its presence is the real test.
            const isImage = 'src' in icon;
            const Icon = isImage ? null : (icon as LucideIcon);
            return (
              <label
                key={title}
                className="has-checked:shadow-glow-pink group border-ink-200 hover:border-ink-300 hover:bg-ink-50 relative flex cursor-pointer flex-col items-center gap-2 rounded-2xl border bg-white px-2.5 py-4 text-center transition-colors has-checked:border-pink-500 has-checked:bg-pink-50"
              >
                <input type="radio" value={title} className="sr-only" {...register('service')} />
                <CircleCheck
                  className="absolute top-2 right-2 size-4 text-pink-600 opacity-0 transition-opacity group-has-checked:opacity-100"
                  aria-hidden="true"
                />
                {isImage ? (
                  <img
                    src={(icon as ImageMetadata).src}
                    alt=""
                    aria-hidden="true"
                    className="size-6 opacity-70 grayscale transition-[opacity,filter] group-has-checked:opacity-100 group-has-checked:grayscale-0"
                  />
                ) : (
                  Icon && (
                    <Icon
                      className="text-ink-400 size-6 transition-colors group-has-checked:text-pink-600"
                      aria-hidden="true"
                    />
                  )
                )}
                <span className="text-ink-700 text-xs leading-tight font-semibold">{title}</span>
              </label>
            );
          })}
        </div>
        {errors.service && <p className={errorText}>{errors.service.message}</p>}
      </fieldset>

      <AnimatePresence initial={false}>
        {selectedService === OTHER_SERVICE && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <label htmlFor="otherService" className={labelBase}>
              What can we help with?
            </label>
            <input
              id="otherService"
              type="text"
              placeholder="e.g. Repiping a rental property"
              aria-invalid={!!errors.otherService}
              aria-describedby={errors.otherService ? 'otherService-error' : undefined}
              className={`${fieldBase} px-4 ${errors.otherService ? errorBase : ''}`}
              {...register('otherService')}
            />
            {errors.otherService && (
              <p id="otherService-error" className={errorText}>
                {errors.otherService.message}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <label htmlFor="message" className={labelBase}>
          Tell Us What's Going On
        </label>
        <div className="relative">
          <MessageSquare className="text-ink-400 pointer-events-none absolute top-4 left-4 size-4" aria-hidden="true" />
          <textarea
            id="message"
            rows={4}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'message-error' : undefined}
            className={`${fieldBase} resize-none pr-4 pl-11 ${errors.message ? errorBase : ''}`}
            {...register('message')}
          />
        </div>
        {errors.message && (
          <p id="message-error" className={errorText}>
            {errors.message.message}
          </p>
        )}
      </div>

      <div>
        <SpecularButton type="submit" disabled={isSubmitting} size="lg" className="group w-full" {...specularPink}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Sending&hellip;
            </>
          ) : (
            <>
              Send Request
              <Send className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </>
          )}
        </SpecularButton>
        <p className="text-ink-500 mt-4 text-center text-xs">
          We'll get back to you within one business day. For emergencies, please call {business.hotline.display}.
        </p>
      </div>
    </form>
  );
}
