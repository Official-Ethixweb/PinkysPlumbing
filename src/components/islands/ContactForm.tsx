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
  Siren,
  Flame,
  Droplets,
  Wrench,
  Toilet,
  Shovel,
  Fuel,
  ThermometerSun,
  type LucideIcon
} from 'lucide-react';
import { contactSchema, OTHER_SERVICE, type ContactFormValues } from '../../lib/contactSchema';
import { zodResolver } from '../../lib/zodResolver';
import { business } from '../../data/business';
import { services } from '../../data/services';
import SpecularButton from './SpecularButton';
import { specularPink } from '../../lib/specularPresets';

const iconMap: Record<string, LucideIcon> = { Siren, Flame, Droplets, Wrench, Toilet, Shovel, Fuel, ThermometerSun };

const serviceTiles = [
  ...services.map((s) => ({ title: s.title, icon: iconMap[s.icon] })),
  { title: 'Emergency / Not Sure', icon: AlertTriangle },
  { title: OTHER_SERVICE, icon: HelpCircle }
];

const fieldBase =
  'w-full rounded-2xl border border-white/15 bg-white/[0.04] py-3.5 text-[15px] text-white placeholder:text-white/35 outline-none transition-colors focus:border-pink-400 focus:bg-white/[0.06]';
const errorBase = 'border-red-400/60 focus:border-red-400';
const labelBase = 'mb-1.5 block text-sm font-semibold text-white/80';
const errorText = 'mt-1.5 text-xs font-medium text-red-400';

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
        className="flex flex-col items-center gap-4 rounded-3xl border border-teal-500/30 bg-teal-500/10 p-10 text-center"
      >
        <CheckCircle2 className="size-12 text-teal-400" aria-hidden="true" />
        <h3 className="font-display text-xl font-bold text-white">Your email app should be open now</h3>
        <p className="max-w-sm text-sm text-white/70">
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
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/35"
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
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/35"
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
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/35"
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
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/35"
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
          {serviceTiles.map(({ title, icon: Icon }) => (
            <label
              key={title}
              className="has-checked:shadow-glow-pink group relative flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.03] px-2.5 py-4 text-center transition-colors hover:border-white/25 hover:bg-white/[0.06] has-checked:border-pink-400/60 has-checked:bg-pink-500/10"
            >
              <input type="radio" value={title} className="sr-only" {...register('service')} />
              <CircleCheck
                className="absolute top-2 right-2 size-4 text-pink-400 opacity-0 transition-opacity group-has-checked:opacity-100"
                aria-hidden="true"
              />
              <Icon
                className="size-6 text-white/60 transition-colors group-has-checked:text-pink-400"
                aria-hidden="true"
              />
              <span className="text-xs leading-tight font-semibold text-white/85">{title}</span>
            </label>
          ))}
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
          <MessageSquare
            className="pointer-events-none absolute top-4 left-4 size-4 text-white/35"
            aria-hidden="true"
          />
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
      <p className="text-center text-xs text-white/50">
        We'll get back to you within one business day. For emergencies, please call {business.hotline.display}.
      </p>
    </form>
  );
}
