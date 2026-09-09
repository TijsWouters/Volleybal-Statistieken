import { useState } from 'react'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ShareIcon from '@mui/icons-material/Share'
import CheckIcon from '@mui/icons-material/Check'
import { IconButton } from '@mui/material'

export function LLMOutput({ text, model, loadingText }: { text: string | undefined, model?: string, loadingText: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!text) return

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    }
    catch (error) {
      console.error('Error copying AI output:', error)
    }
  }

  const handleShare = async () => {
    if (!text) return

    try {
      await navigator.share({ text })
    }
    catch (error) {
      console.error('Error sharing AI output:', error)
    }
  }

  return (
    <div className="w-full px-2 pb-2 pt-1">
      <div className="relative rounded-3xl border border-panel-border bg-background p-4 pb-3 shadow-[0_4px_12px_rgba(0,0,0,0.16)] dark:shadow-[0_4px_14px_rgba(0,0,0,0.4)]">
        <div className="text-[0.98rem] leading-relaxed text-primary dark:text-white">
          <div className="float-right -mr-2 -mt-2 ml-2 flex">
            { navigator.clipboard && (
              <IconButton
                aria-label={copied ? 'Gekopieerd' : 'Kopieer AI-tekst'}
                title={copied ? 'Gekopieerd' : 'Kopieer tekst'}
                size="medium"
                onClick={handleCopy}
                disabled={!text}
                className="text-accent"
              >
                {copied ? <CheckIcon /> : <ContentCopyIcon />}
              </IconButton>
            )}
            { navigator.canShare && navigator.canShare({ text: text! }) && (
              <IconButton
                aria-label="Deel AI-tekst"
                title="Deel tekst"
                size="medium"
                disabled={!text}
                className="text-accent"
                onClick={handleShare}
              >
                <ShareIcon />
              </IconButton>
            )}
          </div>
          <p className="whitespace-pre-wrap">{text ? text : loadingText}</p>
        </div>

        <span
          aria-hidden="true"
          className="absolute -bottom-[0.85rem] right-5.75 h-0 w-0 border-l-12 border-r-12 border-t-14 border-l-transparent border-r-transparent border-t-background filter-[drop-shadow(1px_2px_1px_var(--color-panel-border))]"
        />
      </div>

      <div className="relative z-10 ml-auto flex w-fit items-center gap-2 pr-1 pt-3">
        <span className="-translate-x-1 text-right text-xs italic text-secondary dark:text-white">{'De bovenstaande text is door AI gegenereerd' + (model ? ` (${model})` : '')}</span>
        <SmartToyIcon className="text-accent" sx={{ fontSize: 63 }} aria-label="AI" />
      </div>
    </div>
  )
}
