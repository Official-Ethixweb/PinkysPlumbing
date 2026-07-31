import type { ReactNode } from 'react';
import { Phone } from 'lucide-react';
import { business } from '../../data/business';
import { findBestMatch } from './knowledge';

// Conversation state carried across turns in a single chat session. Nothing
// here is persisted between sessions, it just lets the bot avoid repeating
// itself and decide *when* it's appropriate to ask for contact info, instead
// of asking on every single message.
export type ChatContext = {
  turns: number;
  topicsDiscussed: string[];
  urgent: boolean;
  substantiveReplies: number;
  leadOffered: boolean;
  leadDeclined: boolean;
  leadSubmitted: boolean;
};

export const initialChatContext: ChatContext = {
  turns: 0,
  topicsDiscussed: [],
  urgent: false,
  substantiveReplies: 0,
  leadOffered: false,
  leadDeclined: false,
  leadSubmitted: false
};

export type SmartReplyResult = {
  content: ReactNode;
  nextContext: ChatContext;
  /** Short plain-text summary for the lead email transcript (bot replies are rich JSX, not plain strings). */
  logLabel: string;
  /** True when this is a good moment to invite the visitor into the lead-capture flow. */
  offerLeadCapture?: boolean;
};

const EMERGENCY_RE = /\b(emergency|urgent|flood|flooding|flooded|sewage|overflow|overflowing|burst|right now|asap)\b/i;
const GREETING_RE = /^\s*(hi|hello|hey|yo|sup|good morning|good afternoon|good evening)\b/i;
const THANKS_RE = /\b(thank|thanks|appreciate it|appreciated)\b/i;
const BYE_RE = /\b(bye|goodbye|see ya|talk later|gotta go)\b/i;
const HUMAN_RE =
  /\b(real person|human|talk to someone|speak to someone|representative|agent|call you|your number|phone number|contact info)\b/i;
const BOOKING_RE =
  /free estimate|get an? (estimate|quote)|\bquote\b|\bschedule\b|\bbook\b|callback|call me back|come out|send (someone|a tech)|set up an appointment|how much (will|does) (it|this|that) cost/i;

const PHONE_RE = /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

/** Picks a phone number or email address a visitor typed unprompted, so the bot can react without being asked. */
export function detectContactInfo(text: string): { phone?: string; email?: string } {
  const phoneMatch = text.match(PHONE_RE);
  const emailMatch = text.match(EMAIL_RE);
  return {
    phone: phoneMatch?.[0]?.trim(),
    email: emailMatch?.[0]?.trim()
  };
}

export function isValidName(value: string): boolean {
  return value.trim().length >= 2;
}
export function isValidPhone(value: string): boolean {
  return value.replace(/\D/g, '').length >= 7;
}
export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

function emergencyReply(): ReactNode {
  return (
    <>
      <p>
        Got it, that sounds urgent. Call our 24/7 emergency line right now, a live dispatcher answers around the clock.
      </p>
      <a
        href={`tel:${business.hotline.tel}`}
        className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-pink-600 px-4 py-2 text-sm font-bold text-white"
      >
        <Phone className="h-3.5 w-3.5" /> {business.hotline.display}
      </a>
    </>
  );
}

function humanReply(): ReactNode {
  return (
    <>
      Of course. Call {business.hotline.display} any time, a real person picks up, not a robot. Or I can grab your info
      right here and have someone call you back.
    </>
  );
}

function bookingReply(): ReactNode {
  return (
    <>
      Happy to help. The fastest way is our estimate form, we typically respond within one business day.{' '}
      <a href="/contact-us/" className="font-semibold text-pink-600 hover:text-pink-700">
        Open the estimate form
      </a>
      . Or tell me your name and number right here and I&rsquo;ll pass it along.
    </>
  );
}

function fallbackReply(): ReactNode {
  return (
    <>
      I&rsquo;m not sure I have a good answer for that one, best to ask a real person. Call {business.hotline.display},
      or I can take your name and number and have someone follow up.
    </>
  );
}

export function getGreetingSmalltalkReply(): ReactNode {
  return <>Hey! What can I help with, a service question, your area, pricing, or connecting you to a person?</>;
}

/**
 * Core reply function. Not an LLM: a small rule engine that checks
 * safety-critical intents first (emergency, human handoff, booking), then
 * falls back to the keyword-scored knowledge base built from the site's own
 * service, FAQ, coupon, and service-area content. `offerLeadCapture` tells
 * the widget it's a good moment to invite the visitor into the guided lead
 * form: it fires on explicit booking intent right away, or organically
 * after a few real answers, and never more than once per session unless the
 * visitor re-asks.
 */
export function getSmartReply(text: string, ctx: ChatContext): SmartReplyResult {
  const nextContext: ChatContext = { ...ctx, turns: ctx.turns + 1 };
  const canOfferExplicit = !ctx.leadSubmitted;
  const canOfferOrganic = !ctx.leadOffered && !ctx.leadDeclined && !ctx.leadSubmitted;

  if (EMERGENCY_RE.test(text)) {
    nextContext.urgent = true;
    nextContext.substantiveReplies += 1;
    return { content: emergencyReply(), nextContext, logLabel: 'Gave emergency call-now instructions' };
  }

  if (ctx.turns === 0 && GREETING_RE.test(text) && text.trim().split(/\s+/).length <= 4) {
    return { content: getGreetingSmalltalkReply(), nextContext, logLabel: 'Greeted the visitor' };
  }
  if (THANKS_RE.test(text)) {
    return {
      content: <>You&rsquo;re welcome! Anything else I can help with?</>,
      nextContext,
      logLabel: 'Acknowledged thanks'
    };
  }
  if (BYE_RE.test(text)) {
    return {
      content: <>Take care! Call {business.hotline.display} any time if something comes up.</>,
      nextContext,
      logLabel: 'Said goodbye'
    };
  }

  if (BOOKING_RE.test(text)) {
    nextContext.substantiveReplies += 1;
    return {
      content: bookingReply(),
      nextContext,
      logLabel: 'Pointed to the estimate form and offered to take contact info',
      offerLeadCapture: canOfferExplicit
    };
  }

  if (HUMAN_RE.test(text)) {
    nextContext.substantiveReplies += 1;
    return {
      content: humanReply(),
      nextContext,
      logLabel: 'Gave phone contact info',
      offerLeadCapture: canOfferExplicit
    };
  }

  const match = findBestMatch(text);
  if (match) {
    nextContext.substantiveReplies += 1;
    if (!nextContext.topicsDiscussed.includes(match.topic)) {
      nextContext.topicsDiscussed = [...nextContext.topicsDiscussed, match.topic];
    }
    const shouldOffer = canOfferOrganic && nextContext.substantiveReplies >= 3;
    return { content: match.reply(), nextContext, logLabel: match.logLabel, offerLeadCapture: shouldOffer };
  }

  return { content: fallbackReply(), nextContext, logLabel: "Didn't have a direct answer, suggested calling" };
}
