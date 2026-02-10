'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FRAUD_QUOTES = [
  '$921B in fraud! 💰',
  'Cha-ching! California style! 💸',
  'So much fraud, so little time! 🕺',
  'EDD said YES to everyone! 📬',
  'PPP? More like cha-ching! 💵',
  'Medi-Cal? Medi-Fraud! 😂',
  'Homeless funds? Gone! 🏃',
  'Tax fraud is my cardio! 🏃‍♂️',
  'Workers comp? Workers oops! 🤷',
  'Insurance fraud = full coverage! 📋',
  'Lab testing? Lab YES-ting! 🧪',
  'Telemedicine? Tele-FRAUD-cine! 📱',
  'Pharmacy? More like harmacy! 💊',
  'DME = Definitely More Everything! 🦽',
  'Home health? Home wealth! 🏠',
  'Hospice fraud? Rest in peace... 💀',
  'Substance abuse? Substance cha-ching! 💉',
  'Education fraud? School’s out! 🎓',
  'Contract fraud? Signed, sealed, delivered! ✍️',
  'Calfresh? More like Cal-cash! 🥬',
  'EIDL? Easy money! 🏦',
  '50K cases and I’m still dancing! 🕺',
  'Recovery rate? What recovery? 😅',
  'California: where dreams AND fraud come true! 🌴',
  'Another day, another billion! 📈',
  'Fraud so big it has its own zip code! 📮',
  'EDD: Employment? Definitely Dancing! 💃',
  'PPP loans: Print, Party, Profit! 🎉',
  'Who needs a 401k when you have fraud? 🤔',
  'Making it rain... taxpayer dollars! 🌧️',
]

export default function FraudQuoteBubble() {
  const [quoteIndex, setQuoteIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % FRAUD_QUOTES.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={quoteIndex}
        initial={{ opacity: 0, y: 4, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 bg-white rounded-xl px-3 py-2 shadow-lg border border-california-border max-w-[200px]"
      >
        <p className="text-xs font-medium text-text-primary text-center">
          {FRAUD_QUOTES[quoteIndex]}
        </p>
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0
            border-l-[6px] border-r-[6px] border-t-[6px]
            border-l-transparent border-r-transparent border-t-white"
        />
      </motion.div>
    </AnimatePresence>
  )
}
